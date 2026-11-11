// Chat secreto entre quien regala y quien recibe.
//   secretMessages  mensajes de cada asignación del sorteo
//
// Privacidad: el mensaje no guarda el participante que lo escribió, solo la
// dirección (fromGiver). Así la API nunca necesita ni puede devolver la
// identidad del "Santa secreto" a quien recibe.
// Ligado a la asignación con ON DELETE CASCADE: si el admin reabre o repite
// el sorteo, las conversaciones de las parejas anteriores se eliminan.
// Idempotente, igual que las migraciones anteriores.
import { DataTypes, Sequelize } from "sequelize";
import { tableExists } from "../schemaHelpers.js";

const TABLE_OPTIONS = { charset: "utf8mb4", collate: "utf8mb4_unicode_ci", engine: "InnoDB" };

export const up = async ({ context: qi }) => {
  if (await tableExists(qi, "secretMessages")) return;

  await qi.createTable(
    "secretMessages",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      assignmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "assignments", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      fromGiver: { type: DataTypes.BOOLEAN, allowNull: false },
      body: { type: DataTypes.STRING(500), allowNull: false },
      readAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    },
    TABLE_OPTIONS
  );
  await qi.addIndex("secretMessages", ["assignmentId", "id"], { name: "secret_messages_assignment_id" });
  console.log("  + secretMessages");
};

export const down = async ({ context: qi }) => {
  if (await tableExists(qi, "secretMessages")) await qi.dropTable("secretMessages");
};
