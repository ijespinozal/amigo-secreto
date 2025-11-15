// src/models/Assignment.js
export default (sequelize, DataTypes) => {
  const Assignment = sequelize.define(
    "Assignment",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      eventId: { type: DataTypes.INTEGER, allowNull: false },
      giverParticipantId: { type: DataTypes.INTEGER, allowNull: false },
      receiverParticipantId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "assignments",
      timestamps: true,
    }
  );
  return Assignment;
};
