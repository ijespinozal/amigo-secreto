// src/config/env.js
// Única fuente de configuración del backend. Valida las variables de entorno
// al arrancar y falla rápido con un mensaje claro si falta algo crítico.
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const errors = [];

const read = (name, { required = false, fallback } = {}) => {
  const value = process.env[name];
  if (value === undefined || value === "") {
    if (required) errors.push(`${name} es obligatorio`);
    return fallback;
  }
  return value;
};

const readBool = (name, fallback = false) => {
  const value = read(name);
  if (value === undefined) return fallback;
  return ["true", "1", "yes"].includes(value.toLowerCase());
};

const readInt = (name, fallback) => {
  const value = read(name);
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) errors.push(`${name} debe ser un número entero`);
  return parsed;
};

const port = readInt("PORT", 5000);

// ---- Base de datos ----
// Se acepta DB_URL (mysql://user:pass@host:port/db), formato habitual de los
// proveedores cloud, o las variables individuales.
const dbUrl = read("DB_URL");

const db = {
  url: dbUrl,
  host: read("DB_HOST", { fallback: "localhost" }),
  port: readInt("DB_PORT", 3306),
  name: read("DB_NAME", { required: !dbUrl }),
  user: read("DB_USER", { required: !dbUrl }),
  password: read("DB_PASSWORD", { fallback: "" }),
  ssl: readBool("DB_SSL", false),
  // CA en formato PEM; en paneles como Render se puede pegar con "\n" literales.
  sslCa: read("DB_SSL_CA")?.replace(/\\n/g, "\n"),
  logging: readBool("DB_LOGGING", false),
};

// ---- Autenticación ----
const jwtSecret = read("JWT_SECRET", { required: true });
if (jwtSecret && isProduction && jwtSecret.length < 32) {
  errors.push("JWT_SECRET debe tener al menos 32 caracteres en producción");
}
const jwtExpiresIn = read("JWT_EXPIRES_IN", { fallback: "7d" });

// ---- CORS ----
// Lista separada por comas de orígenes permitidos.
const corsOrigins = (
  read("CORS_ORIGIN", {
    required: isProduction,
    fallback: "http://localhost:5173",
  }) || ""
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

if (errors.length > 0) {
  console.error("Configuración inválida:\n  - " + errors.join("\n  - "));
  process.exit(1);
}

const env = Object.freeze({
  nodeEnv: NODE_ENV,
  isProduction,
  port,
  db: Object.freeze(db),
  jwt: Object.freeze({ secret: jwtSecret, expiresIn: jwtExpiresIn }),
  corsOrigins: Object.freeze(corsOrigins),
});

export default env;
