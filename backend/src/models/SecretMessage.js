// src/models/SecretMessage.js
// Mensaje del chat secreto. No guarda quién lo escribió: solo si fue quien
// regala (fromGiver = true) o quien recibe (false). Ver migración 0006.
export default (sequelize, DataTypes) => {
  const SecretMessage = sequelize.define(
    "SecretMessage",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      assignmentId: { type: DataTypes.INTEGER, allowNull: false },
      fromGiver: { type: DataTypes.BOOLEAN, allowNull: false },
      body: { type: DataTypes.STRING(500), allowNull: false },
      readAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "secretMessages",
      timestamps: true,
    }
  );
  return SecretMessage;
};
