// Por evento: ¿se bloquea editar/eliminar opciones de regalo tras el sorteo?
// Por defecto sí (el comportamiento que ya tenían todos los eventos): los
// eventos existentes reciben TRUE y no cambian hasta que el admin lo decida.
// Solo agrega una columna: idempotente, reversible y sin tocar otros datos.
import { DataTypes } from "sequelize";
import { ensureColumn, getColumn } from "../schemaHelpers.js";

export const up = async ({ context: qi }) => {
  await ensureColumn(qi, "events", "lockGiftsAfterDraw", { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true });
};

export const down = async ({ context: qi }) => {
  if (await getColumn(qi, "events", "lockGiftsAfterDraw")) await qi.removeColumn("events", "lockGiftsAfterDraw");
};
