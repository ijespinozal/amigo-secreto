// src/models/Event.js
export default (sequelize, DataTypes) => {
  const Event = sequelize.define(
    "Event",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      date_event: { type: DataTypes.DATE, allowNull: true },
      createdBy: { type: DataTypes.INTEGER, allowNull: true },
      drawDone: { type: DataTypes.BOOLEAN, defaultValue: false },
      drawDate: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "events",
      timestamps: true,
    }
  );

  return Event;
};
