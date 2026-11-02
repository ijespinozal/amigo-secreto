// src/config/database.js
import { Sequelize } from "sequelize";
import env from "./env.js";

const { db } = env;

// Con CA explícita se valida contra ella; sin CA se usan las raíces del sistema.
export const sslOptions = db.ssl
  ? { ...(db.sslCa ? { ca: db.sslCa } : {}), rejectUnauthorized: true }
  : undefined;

const dialectOptions = sslOptions ? { ssl: sslOptions } : {};

const options = {
  dialect: "mysql",
  logging: db.logging ? console.log : false,
  dialectOptions,
  // Se guardan las fechas en UTC para que local y producción se comporten igual.
  timezone: "+00:00",
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
};

const sequelize = db.url
  ? new Sequelize(db.url, options)
  : new Sequelize(db.name, db.user, db.password, {
      ...options,
      host: db.host,
      port: db.port,
    });

export default sequelize;
