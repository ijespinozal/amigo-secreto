// src/models/Participant.js
export default (sequelize, DataTypes) => {
  const Participant = sequelize.define(
    "Participant",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      eventId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: true },
      phone: { type: DataTypes.STRING(20), allowNull: false },
      firstName: { type: DataTypes.STRING(100) },
      lastName: { type: DataTypes.STRING(100) },
      email: { type: DataTypes.STRING(255), allowNull: true },
    },
    {
      tableName: "participants",
      timestamps: true,
    }
  );
  return Participant;
};
