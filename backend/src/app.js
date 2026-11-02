// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import env from "./config/env.js";

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

// healthcheck
app.get("/health", (req, res) => res.json({ ok: true }));

// error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error" });
});

export default app;
