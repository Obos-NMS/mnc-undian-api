"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Winner extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.participant, { foreignKey: "participant_id" });
      this.belongsTo(models.raffle_prize, {
        foreignKey: "raffle_prize_id",
        onDelete: "CASCADE",
      });
    }
  }
  Winner.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      participant_id: {
        allowNull: true,
        references: { model: "participants", key: "id" },
        type: DataTypes.INTEGER,
      },
      raffle_prize_id: {
        allowNull: true,
        references: { model: "raffle_prizes", key: "id" },
        type: DataTypes.INTEGER,
      },
      status: {
        values: ["invalid", "valid"],
        defaultValue: "invalid",
        type: DataTypes.ENUM,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "winner",
      tableName: "winners",
      underscored: true,
    }
  );

  return Winner;
};
