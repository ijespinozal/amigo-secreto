// src/server.js
import env from "./config/env.js";
import app from "./app.js";
import { connectDB, sequelize } from "./models/index.js";
import { migrator } from "./database/migrator.js";

const assertSchemaUpToDate = async () => {
  const pending = await migrator.pending();
  if (pending.length === 0) return;

  const names = pending.map((m) => m.name).join(", ");
  if (env.isProduction) {
    throw new Error(`Migraciones pendientes: ${names}. Ejecuta "npm run db:migrate".`);
  }
  console.warn(`⚠ Migraciones pendientes: ${names}. Ejecuta "npm run db:migrate".`);
};

const start = async () => {
  try {
    await connectDB();
    await assertSchemaUpToDate();

    const server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
    });

    // Render envía SIGTERM en cada deploy/reinicio: se terminan las peticiones
    // en curso y se cierra el pool de conexiones antes de salir.
    const shutdown = (signal) => {
      console.log(`${signal} recibido, cerrando servidor...`);
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
