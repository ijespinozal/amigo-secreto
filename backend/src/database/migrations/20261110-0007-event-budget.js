// Presupuesto sugerido por regalo (en soles). Opcional: los eventos
// existentes quedan sin presupuesto hasta que el admin lo defina.
// Solo agrega una columna: idempotente y sin tocar datos existentes.
import { DataTypes } from "sequelize";
import { ensureColumn, getColumn } from "../schemaHelpers.js";

export const up = async ({ context: qi }) => {
  await ensureColumn(qi, "events", "budget", { type: DataTypes.DECIMAL(10, 2), allowNull: true });
};

export const down = async ({ context: qi }) => {
  if (await getColumn(qi, "events", "budget")) await qi.removeColumn("events", "budget");
};
