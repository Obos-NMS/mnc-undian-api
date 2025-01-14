'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('winners', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      participant_id: {
        allowNull: true,
        references: { model: "participants", key: 'id' },
        type: Sequelize.INTEGER,
      },
      raffle_prize_id: {
        allowNull: true,
        references: { model: "raffle_prizes", key: 'id' },
        type: Sequelize.INTEGER,
      },
      status: {
        values: ['invalid', 'valid'],
        defaultValue: 'invalid',
        type: Sequelize.ENUM,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('winners');
  }
};