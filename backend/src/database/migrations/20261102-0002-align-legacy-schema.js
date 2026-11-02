// Alinea BDs heredadas (bd.sql original o tablas creadas con `sync()`) con el
// esquema de 0001. En una BD creada por 0001 todos los pasos son no-op.
import { DataTypes, Sequelize } from "sequelize";
import { ensureColumn, ensureForeignKey, ensureUniqueIndex, getColumn } from "../schemaHelpers.js";

const TABLES = ["users", "events", "participants", "giftOptions", "assignments"];

const timestampColumn = () => ({
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
});

export const up = async ({ context: qi }) => {
  // 1) Timestamps que Sequelize necesita (timestamps: true en todos los modelos).
  for (const table of TABLES) {
    await ensureColumn(qi, table, "createdAt", timestampColumn());
    await ensureColumn(qi, table, "updatedAt", timestampColumn());
  }

  // 2) date_event es una fecha de calendario: DATE evita desfases por zona horaria.
  const dateEvent = await getColumn(qi, "events", "date_event");
  if (dateEvent && dateEvent.dataType !== "date") {
    await qi.changeColumn("events", "date_event", { type: DataTypes.DATEONLY, allowNull: true });
    console.log("  ~ events.date_event -> DATE");
  }

  // 3) giftOptions.title es obligatorio en el modelo.
  const giftTitle = await getColumn(qi, "giftOptions", "title");
  if (giftTitle && giftTitle.nullable === "YES") {
    await qi.sequelize.query(
      "UPDATE `giftOptions` SET `title` = '(sin título)' WHERE `title` IS NULL OR `title` = ''"
    );
    await qi.changeColumn("giftOptions", "title", { type: DataTypes.STRING(255), allowNull: false });
    console.log("  ~ giftOptions.title -> NOT NULL");
  }

  // 4) Integridad referencial: los borrados se propagan en vez de fallar.
  const foreignKeys = [
    { table: "events", column: "createdBy", refTable: "users", onDelete: "SET NULL" },
    { table: "participants", column: "eventId", refTable: "events", onDelete: "CASCADE" },
    { table: "participants", column: "userId", refTable: "users", onDelete: "SET NULL" },
    { table: "giftOptions", column: "participantId", refTable: "participants", onDelete: "CASCADE" },
    { table: "assignments", column: "eventId", refTable: "events", onDelete: "CASCADE" },
    { table: "assignments", column: "giverParticipantId", refTable: "participants", onDelete: "CASCADE" },
    { table: "assignments", column: "receiverParticipantId", refTable: "participants", onDelete: "CASCADE" },
  ];
  for (const definition of foreignKeys) {
    await ensureForeignKey(qi, definition);
  }

  // 5) Unicidad (y limpieza de índices duplicados creados por sync alter).
  await ensureUniqueIndex(qi, "users", ["phone"], "users_phone_unique");
  await ensureUniqueIndex(qi, "participants", ["eventId", "phone"], "participants_event_phone_unique");
  await ensureUniqueIndex(qi, "assignments", ["eventId", "giverParticipantId"], "assignments_event_giver_unique");
};

// Alineación irreversible a propósito: deshacerla reintroduciría los defectos
// del esquema heredado. Revertir el esquema completo es tarea de 0001.down.
export const down = async () => {};
