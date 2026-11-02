// src/models/ScheduleActivityPrize.js
export default (sequelize, DataTypes) => {
  const ScheduleActivityPrize = sequelize.define(
    "ScheduleActivityPrize",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      activityId: { type: DataTypes.INTEGER, allowNull: false },
      position: { type: DataTypes.INTEGER, allowNull: false },
      description: { type: DataTypes.STRING(255), allowNull: false },
    },
    {
      tableName: "scheduleActivityPrizes",
      timestamps: true,
    }
  );
  return ScheduleActivityPrize;
};
