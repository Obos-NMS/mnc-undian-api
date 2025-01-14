'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('participant_field_values', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      value: { allowNull: true, type: Sequelize.STRING },
      participant_field_name_id: {
        allowNull: false,
        references: { model: "participant_field_names", key: 'id' },
        type: Sequelize.INTEGER,
      },
      participant_id: {
        allowNull: false,
        references: { model: "participants", key: 'id' },
        type: Sequelize.INTEGER,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('participant_field_values');
  }
};