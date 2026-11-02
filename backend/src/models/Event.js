// src/models/Event.js
export default (sequelize, DataTypes) => {
  const Event = sequelize.define(
    "Event",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT },
      // DATEONLY ("YYYY-MM-DD"): fecha de calendario sin hora ni zona horaria.
      date_event: { type: DataTypes.DATEONLY, allowNull: true },
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
