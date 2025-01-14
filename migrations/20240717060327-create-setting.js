'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: { allowNull: false, type: Sequelize.TEXT('long') },
      shuffle_duration: { allowNull: false, type: Sequelize.INTEGER, defaultValue: 0 },
      is_repeat_win_allowed: { type: Sequelize.BOOLEAN, defaultValue: false },
      reset_data_password: { allowNull: false, type: Sequelize.STRING },
      company_logo: { allowNull: true, type: Sequelize.STRING },
      headline_text: { allowNull: true, type: Sequelize.TEXT('long') },
      headline_supporting_text: { allowNull: true, type: Sequelize.TEXT('long') },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('settings');
  }
};