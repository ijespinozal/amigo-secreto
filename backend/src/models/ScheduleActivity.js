// src/models/ScheduleActivity.js
export default (sequelize, DataTypes) => {
  const ScheduleActivity = sequelize.define(
    "ScheduleActivity",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      eventId: { type: DataTypes.INTEGER, allowNull: false },
      // Orden manual: un cronograma puede cruzar la medianoche (p. ej. 23:30 -> 00:00),
      // así que no se ordena por hora.
      position: { type: DataTypes.INTEGER, allowNull: false },
      // "HH:MM:SS" (TIME de MySQL)
      startTime: { type: DataTypes.TIME, allowNull: false },
      title: { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      // Texto libre: "10 personas", "TODOS", "Parejas"...
      participantsLabel: { type: DataTypes.STRING(50), allowNull: true },
      icon: { type: DataTypes.STRING(16), allowNull: true },
      referenceUrl: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: "scheduleActivities",
      timestamps: true,
    }
  );
  return ScheduleActivity;
};
