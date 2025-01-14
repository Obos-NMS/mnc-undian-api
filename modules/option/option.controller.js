const Models = require("@models");
const Request = require("@helper/reguest");
const { getDestUploadFile, getFileUrl } = require("@helper/file");
const { Op, QueryTypes } = require("sequelize");

exports.rafflePrizeList = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where.name = {
        [Op.like]: `%${search}%`,
      };
    }

    const raffle_prizes = await Models.raffle_prize.findAll({
      where,
      limit: 100,
    });
    Request.success(res, {
      data: raffle_prizes.map((e) => {
        return {
          label: e.name,
          value: e.id,
          photo: e.photo ? getFileUrl('raffle_prize') + e.photo : null,
        };
      }),
    });
  } catch (error) {
    Request.error(res, error);
  }
};

exports.participantFieldNameList = async (req, res) => {
  try {
    const { search } = req.query;

    const participant_field_names = await Models.participant_field_name.findAll({
      attributes: ["id", "name", "index"],
      order: [['index', 'ASC']],
      limit: 100,
    });

    Request.success(res, {
      data: participant_field_names.map((e) => {
        return { label: e.name, value: e.id };
      }),
    });
  } catch (error) {
    Request.error(res, error);
  }
};