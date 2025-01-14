const { check } = require("express-validator");
const Models = require("@models");
const Request = require("@helper/reguest");
const { validateRequest } = require("@validators/request");
const { getDestUploadFile, getFileUrl } = require("@helper/file");

exports.findOneData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await Models.winner.findOne({
      where: { id: id },
      attributes: ["id", "status", "created_at", "updated_at"],
      include: [
        {
          association: "participant",
          include: [
            {
              association: "participant_field_values",
              attributes: ["id", "value"],
              include: [
                {
                  association: "participant_field_name",
                  attributes: ["id", "name", "index"],
                },
              ],
            },
          ],
          attributes: [
            "id",
            "raffle_code",
            "identifier_code",
            "created_at",
            "updated_at",
          ],
        },
        {
          association: "raffle_prize",
          attributes: ["id", "name", "photo", "created_at", "updated_at"],
        },
      ],
    });

    if (!data) throw "Not found";
    if (data.raffle_prize && data.raffle_prize.photo) {
      data.raffle_prize.photo = data.raffle_prize.photo
        ? getFileUrl("raffle_prize") + data.raffle_prize.photo
        : null;
    }

    let result = {
      id: data.id,
      status: data.status,
      participant: data.participant,
      raffle_prize: data.raffle_prize,
      identifier_code: data.identifier_code,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    req.findData = result;

    next();
  } catch (error) {
    console.log(error);
    Request.notFound(res, error);
  }
};

exports.setWinnerRequest = [
  check("participant_id").notEmpty(),
  check("raffle_prize_id").notEmpty(),
  check("status").isString().isIn(["invalid", "valid"]).notEmpty(),
  validateRequest,
];
exports.setStatusRequest = [
  check("status").isString().isIn(["invalid", "valid"]).notEmpty(),
  validateRequest,
];
exports.resetRequest = [
  check("reset_data_password").notEmpty().bail().isString(),
  validateRequest,
];
