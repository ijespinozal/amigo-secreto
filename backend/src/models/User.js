// src/models/User.js
export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      phone: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      firstName: { type: DataTypes.STRING(100) },
      lastName: { type: DataTypes.STRING(100) },
      role: { type: DataTypes.ENUM("admin", "user"), defaultValue: "user" },
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
