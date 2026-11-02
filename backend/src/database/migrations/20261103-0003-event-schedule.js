// Cronograma de actividades por evento (antes estaba fijo en el frontend).
//   scheduleActivities      actividades de un evento, en orden manual (position)
//   scheduleActivityPrizes  premios de cada actividad
//   events.schedulePublished  el admin decide cuándo lo ven los participantes
// Idempotente, igual que 0001/0002.
import { DataTypes, Sequelize } from "sequelize";
import { ensureColumn, tableExists } from "../schemaHelpers.js";

const TABLE_OPTIONS = { charset: "utf8mb4", collate: "utf8mb4_unicode_ci", engine: "InnoDB" };

const timestamps = () => ({
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
});

export const up = async ({ context: qi }) => {
  await ensureColumn(qi, "events", "schedulePublished", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  if (!(await tableExists(qi, "scheduleActivities"))) {
    await qi.createTable(
      "scheduleActivities",
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        eventId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "events", key: "id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        position: { type: DataTypes.INTEGER, allowNull: false },
        startTime: { type: DataTypes.TIME, allowNull: false },
        title: { type: DataTypes.STRING(150), allowNull: false },
        description: { type: DataTypes.TEXT },
        participantsLabel: { type: DataTypes.STRING(50) },
        icon: { type: DataTypes.STRING(16) },
        referenceUrl: { type: DataTypes.STRING(500) },
        ...timestamps(),
      },
      TABLE_OPTIONS
    );
    await qi.addIndex("scheduleActivities", ["eventId", "position"], { name: "schedule_activities_event_position" });
    console.log("  + scheduleActivities");
  }

  if (!(await tableExists(qi, "scheduleActivityPrizes"))) {
    await qi.createTable(
      "scheduleActivityPrizes",
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        activityId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "scheduleActivities", key: "id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        position: { type: DataTypes.INTEGER, allowNull: false },
        description: { type: DataTypes.STRING(255), allowNull: false },
        ...timestamps(),
      },
      TABLE_OPTIONS
    );
    console.log("  + scheduleActivityPrizes");
  }
};

export const down = async ({ context: qi }) => {
  await qi.dropTable("scheduleActivityPrizes");
  await qi.dropTable("scheduleActivities");
  await qi.removeColumn("events", "schedulePublished");
};
