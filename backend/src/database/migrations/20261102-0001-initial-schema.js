// Esquema inicial completo. Solo crea las tablas que no existen, de modo que es
// seguro tanto en una BD vacía como en una BD heredada (creada con el bd.sql
// original o con `sync()`); las diferencias de esas BDs se corrigen en 0002.
import { DataTypes, Sequelize } from "sequelize";
import { tableExists } from "../schemaHelpers.js";

const TABLE_OPTIONS = {
  charset: "utf8mb4",
  collate: "utf8mb4_unicode_ci",
  engine: "InnoDB",
};

const id = () => ({ type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true });

const timestamps = () => ({
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
});

const fk = (table, onDelete, allowNull = false) => ({
  type: DataTypes.INTEGER,
  allowNull,
  references: { model: table, key: "id" },
  onDelete,
  onUpdate: "CASCADE",
});

const createIfMissing = async (qi, table, attributes, indexes = []) => {
  if (await tableExists(qi, table)) {
    console.log(`  = ${table} ya existe, se omite`);
    return;
  }
  await qi.createTable(table, attributes, TABLE_OPTIONS);
  for (const index of indexes) {
    await qi.addIndex(table, index.fields, { name: index.name, unique: true });
  }
  console.log(`  + ${table}`);
};

export const up = async ({ context: qi }) => {
  await createIfMissing(
    qi,
    "users",
    {
      id: id(),
      phone: { type: DataTypes.STRING(20), allowNull: false },
      password: { type: DataTypes.STRING(255), allowNull: false },
      firstName: { type: DataTypes.STRING(100) },
      lastName: { type: DataTypes.STRING(100) },
      role: { type: DataTypes.ENUM("admin", "user"), allowNull: false, defaultValue: "user" },
      ...timestamps(),
    },
    [{ name: "users_phone_unique", fields: ["phone"] }]
  );

  await createIfMissing(qi, "events", {
    id: id(),
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    date_event: { type: DataTypes.DATEONLY },
    createdBy: fk("users", "SET NULL", true),
    drawDone: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    drawDate: { type: DataTypes.DATE },
    ...timestamps(),
  });

  await createIfMissing(
    qi,
    "participants",
    {
      id: id(),
      eventId: fk("events", "CASCADE"),
      userId: fk("users", "SET NULL", true),
      phone: { type: DataTypes.STRING(20), allowNull: false },
      firstName: { type: DataTypes.STRING(100) },
      lastName: { type: DataTypes.STRING(100) },
      email: { type: DataTypes.STRING(255) },
      ...timestamps(),
    },
    [{ name: "participants_event_phone_unique", fields: ["eventId", "phone"] }]
  );

  await createIfMissing(qi, "giftOptions", {
    id: id(),
    participantId: fk("participants", "CASCADE"),
    title: { type: DataTypes.STRING(255), allowNull: false },
    note: { type: DataTypes.TEXT },
    donation: { type: DataTypes.STRING(255) },
    link: { type: DataTypes.STRING(500) },
    ...timestamps(),
  });

  await createIfMissing(
    qi,
    "assignments",
    {
      id: id(),
      eventId: fk("events", "CASCADE"),
      giverParticipantId: fk("participants", "CASCADE"),
      receiverParticipantId: fk("participants", "CASCADE"),
      ...timestamps(),
    },
    [{ name: "assignments_event_giver_unique", fields: ["eventId", "giverParticipantId"] }]
  );
};

export const down = async ({ context: qi }) => {
  // Orden inverso a las dependencias de FK.
  for (const table of ["assignments", "giftOptions", "participants", "events", "users"]) {
    await qi.dropTable(table);
  }
};
