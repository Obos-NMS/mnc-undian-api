'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('participant_display_fields', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      participant_field_name_id: {
        allowNull: false,
        references: { model: "participant_field_names", key: 'id' },
        type: Sequelize.INTEGER,
      },
      index: { allowNull: false, type: Sequelize.INTEGER },
      setting_id: {
        allowNull: true,
        references: { model: "settings", key: 'id' },
        type: Sequelize.INTEGER,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('participant_display_fields');
  }
};