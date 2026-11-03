// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import env from "./config/env.js";
import sequelize from "./config/database.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Render (y la mayoría de PaaS) termina TLS en un proxy delante de la app.
app.set("trust proxy", 1);

// Cabeceras de seguridad estándar (nosniff, frameguard, HSTS, etc.).
app.use(helmet());

app.use(
  cors({
    // Solo los orígenes declarados en CORS_ORIGIN. Las peticiones sin Origin
    // (curl, health checks de Render) no son de navegador y se permiten.
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// healthcheck (liveness): solo el proceso. Lo usa Render; no toca la BD para
// que un corte momentáneo de la base no provoque reinicios del servicio.
app.get("/health", (req, res) => res.json({ ok: true }));

// healthcheck de la BD: lo consulta un monitor externo (UptimeRobot) cada
// pocos minutos. Mantiene despierto el servicio de Render y genera actividad
// en la BD para que el plan gratuito de Aiven no la apague por inactividad.
const DB_HEALTH_TIMEOUT_MS = 5000;

app.get("/health/db", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const started = Date.now();
  let timer;
  try {
    await Promise.race([
      sequelize.query("SELECT 1"),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timeout de ${DB_HEALTH_TIMEOUT_MS} ms`)), DB_HEALTH_TIMEOUT_MS);
      }),
    ]);
    res.json({ ok: true, db: "up", latencyMs: Date.now() - started });
  } catch (err) {
    // El detalle va al log; al cliente no se le exponen datos de la conexión.
    // Algunos fallos de red (p. ej. AggregateError de IPv4/IPv6) llegan sin mensaje.
    const cause = err.message || err.original?.code || err.parent?.code || err.name;
    console.error("Health check de BD falló:", cause);
    res.status(503).json({ ok: false, db: "down" });
  } finally {
    clearTimeout(timer);
  }
});

// error handler
// Los errores del cliente que detecta Express antes de las rutas (JSON
// malformado, cuerpo demasiado grande) responden con su código 4xx y un
// mensaje genérico; el resto es un fallo del servidor y se registra.
const CLIENT_ERRORS = {
  "entity.parse.failed": "El cuerpo de la solicitud no es un JSON válido.",
  "entity.too.large": "La solicitud es demasiado grande.",
};

app.use((err, req, res, next) => {
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: CLIENT_ERRORS[err.type] ?? "Solicitud inválida." });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error" });
});

export default app;
