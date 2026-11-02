// src/database/migrator.js
// Migraciones y seeders con Umzug (motor de sequelize-cli) en ESM nativo.
// El historial se guarda en las mismas tablas que usa sequelize-cli:
// SequelizeMeta (migraciones) y SequelizeData (seeders).
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Umzug, SequelizeStorage } from "umzug";
import sequelize from "../config/database.js";

const baseDir = path.dirname(fileURLToPath(import.meta.url));

const createRunner = (folder, modelName) =>
  new Umzug({
    migrations: {
      // fast-glob requiere "/" incluso en Windows.
      glob: `${path.join(baseDir, folder).replace(/\\/g, "/")}/*.js`,
      resolve: ({ name, path: filePath, context }) => {
        const load = () => import(pathToFileURL(filePath).href);
        return {
          name,
          up: async () => (await load()).up({ context }),
          down: async () => (await load()).down({ context }),
        };
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, modelName }),
    logger: undefined,
  });

const withLogging = (runner, label) => {
  runner.on("migrating", ({ name }) => console.log(`[${label}] ↑ ${name}`));
  runner.on("migrated", ({ name }) => console.log(`[${label}] ✔ ${name}`));
  runner.on("reverting", ({ name }) => console.log(`[${label}] ↓ ${name}`));
  runner.on("reverted", ({ name }) => console.log(`[${label}] ✔ ${name} revertido`));
  return runner;
};

export const migrator = withLogging(createRunner("migrations", "SequelizeMeta"), "migración");
export const seeder = withLogging(createRunner("seeders", "SequelizeData"), "seed");
