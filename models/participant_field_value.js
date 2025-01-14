'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ParticipantFieldValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.participant_field_name, { foreignKey: 'participant_field_name_id' });
      this.belongsTo(models.participant, { foreignKey: 'participant_id' });
    }
  }
  ParticipantFieldValue.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    value: { allowNull: true, type: DataTypes.STRING },
    participant_field_name_id: {
      allowNull: false,
      references: { model: "participant_field_names", key: 'id' },
      type: DataTypes.INTEGER,
    },
    participant_id: {
      allowNull: false,
      references: { model: "participants", key: 'id' },
      type: DataTypes.INTEGER,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'participant_field_value',
    tableName: 'participant_field_values',
    underscored: true,
  });
  return ParticipantFieldValue;
};