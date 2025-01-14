'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SettingsParticipantDisplayField extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.participant_field_name, { foreignKey: 'participant_field_name_id', onDelete: 'CASCADE' });
      this.belongsTo(models.setting, { foreignKey: 'setting_id' });
    }
  }
  SettingsParticipantDisplayField.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    participant_field_name_id: {
      allowNull: false,
      references: { model: "participant_field_names", key: 'id' },
      type: DataTypes.INTEGER,
    },
    index: { allowNull: false, type: DataTypes.INTEGER },
    setting_id: {
      allowNull: true,
      references: { model: "settings", key: 'id' },
      type: DataTypes.INTEGER,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'participant_display_field',
    tableName: 'participant_display_fields',
    underscored: true,
  });
  return SettingsParticipantDisplayField;
};