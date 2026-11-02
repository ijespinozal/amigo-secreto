// src/database/cli.js
// Uso: node src/database/cli.js <comando> [opciones]  (ver scripts db:* en package.json)
import mysql from "mysql2/promise";
import env from "../config/env.js";
import sequelize, { sslOptions } from "../config/database.js";
import { migrator, seeder } from "./migrator.js";
import { ensureAdmin } from "./adminBootstrap.js";

const assertNotProduction = (command) => {
  if (env.isProduction) throw new Error(`"${command}" está deshabilitado en producción`);
};

/** Crea la base de datos si no existe (pensado para desarrollo local). */
const createDatabase = async () => {
  if (env.db.url) {
    console.log("DB_URL configurada: la base la gestiona el proveedor, no se crea.");
    return;
  }
  const { name, host, port, user, password } = env.db;
  if (!/^[A-Za-z0-9_]+$/.test(name)) throw new Error(`DB_NAME inválido: ${name}`);

  const connection = await mysql.createConnection({ host, port, user, password, ssl: sslOptions });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`Base de datos "${name}" lista.`);
  } finally {
    await connection.end();
  }
};

const printStatus = async () => {
  const executed = await migrator.executed();
  const pending = await migrator.pending();
  console.log("Ejecutadas:");
  executed.forEach((m) => console.log(`  ✔ ${m.name}`));
  console.log("Pendientes:");
  pending.forEach((m) => console.log(`  • ${m.name}`));
  if (pending.length === 0) console.log("  (ninguna)");
};

const createAdminFromEnv = async ({ ifConfigured }) => {
  const phone = process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;
  if (!phone || !password) {
    if (ifConfigured) {
      console.log("ADMIN_PHONE/ADMIN_PASSWORD no configurados: se omite el bootstrap del admin.");
      return;
    }
    throw new Error("Define ADMIN_PHONE y ADMIN_PASSWORD para crear el administrador");
  }
  const result = await ensureAdmin({
    phone,
    password,
    firstName: process.env.ADMIN_FIRST_NAME || "Admin",
    lastName: process.env.ADMIN_LAST_NAME || null,
  });
  const messages = {
    created: "Administrador creado.",
    promoted: "El usuario ya existía y fue promovido a administrador.",
    unchanged: "El administrador ya existe; no se realizaron cambios.",
  };
  console.log(messages[result]);
};

const commands = {
  create: createDatabase,
  migrate: () => migrator.up(),
  "migrate:undo": () => migrator.down(),
  status: printStatus,
  seed: async () => {
    assertNotProduction("seed");
    await seeder.up();
  },
  "seed:undo": async () => {
    assertNotProduction("seed:undo");
    await seeder.down({ to: 0 });
  },
  admin: () => createAdminFromEnv({ ifConfigured: process.argv.includes("--if-configured") }),
};

const [command] = process.argv.slice(2);
const run = commands[command];

if (!run) {
  console.error(`Comando desconocido: ${command ?? "(vacío)"}\nDisponibles: ${Object.keys(commands).join(", ")}`);
  process.exit(1);
}

try {
  await run();
} catch (err) {
  console.error(`✖ ${command} falló:`, err.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
