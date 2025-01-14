'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.participant_display_field, { foreignKey: 'setting_id', as: 'participant_display_fields' });
    }
  }
  Setting.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: { allowNull: false, type: DataTypes.TEXT('long') },
    shuffle_duration: { allowNull: false, type: DataTypes.INTEGER, defaultValue: 0 },
    is_repeat_win_allowed: { type: DataTypes.BOOLEAN, defaultValue: false },
    company_logo: { allowNull: true, type: DataTypes.STRING },
    headline_text: { allowNull: true, type: DataTypes.TEXT('long') },
    headline_supporting_text: { allowNull: true, type: DataTypes.TEXT('long') },
    reset_data_password: { allowNull: false, type: DataTypes.STRING },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'setting',
    tableName: 'settings',
    underscored: true,
  });
  return Setting;
};