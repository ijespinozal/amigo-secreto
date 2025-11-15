// src/models/GiftOption.js
export default (sequelize, DataTypes) => {
  const GiftOption = sequelize.define(
    "GiftOption",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      participantId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: false },
      note: { type: DataTypes.TEXT, allowNull: true },
      donation: { type: DataTypes.STRING(255), allowNull: true },
      link: { type: DataTypes.STRING(500), allowNull: true },
    },
    {
      tableName: "giftOptions",
      timestamps: true,
    }
  );
  return GiftOption;
};
