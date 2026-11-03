// Hora de inicio y lugar del evento. Ambos opcionales: los eventos existentes
// no los tienen y el admin puede definirlos después.
//   events.startTime  TIME, hora local del evento ("HH:MM")
//   events.location   texto libre (dirección o referencia)
// Solo agrega columnas: idempotente y sin tocar datos existentes.
import { DataTypes } from "sequelize";
import { ensureColumn, getColumn } from "../schemaHelpers.js";

export const up = async ({ context: qi }) => {
  await ensureColumn(qi, "events", "startTime", { type: DataTypes.TIME, allowNull: true });
  await ensureColumn(qi, "events", "location", { type: DataTypes.STRING(255), allowNull: true });
};

export const down = async ({ context: qi }) => {
  for (const column of ["location", "startTime"]) {
    if (await getColumn(qi, "events", column)) await qi.removeColumn("events", column);
  }
};
