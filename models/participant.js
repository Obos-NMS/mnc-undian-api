'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Participants extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.participant_field_value, { foreignKey: 'participant_id', as: 'participant_field_values' });
    }
  }
  Participants.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    raffle_code: {
      unique: true,
      allowNull: false,
      type: DataTypes.STRING,
    },
    identifier_code: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'participant',
    tableName: 'participants',
    underscored: true,
  });
  return Participants;
};