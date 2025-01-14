const Models = require("@models");
const Request = require("@helper/reguest");
const { getDestUploadFile, getFileUrl, saveImage } = require("@helper/file");

const { collections, exportData } = require("./raffle-prize.repositories");
const uuid = require("uuid");

exports.index = async (req, res) => {
  try {
    Request.success(res, await collections(req, res));
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.show = async (req, res) => {
  try {
    Request.success(res, { data: req.findData });
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.store = async (req, res) => {
  try {
    const post = req.body;
    post.id = uuid.v4();

    var input = { name: post.name }
    if (req.file?.photo) {
      input.photo = saveImage(req.file.photo, post.id, "raffle_prize");
    }

    const newData = await Models.raffle_prize.create(input);
    Request.success(res, { message: "success", data: newData });
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.findData;
    const post = req.body;

    post.id = uuid.v4();

    var input = { name: post.name }
    if (req.file?.photo) {
      input.photo = saveImage(req.file.photo, post.id, "raffle_prize");
    }

    await Models.raffle_prize.update(input, { where: { id: id } });
    Request.success(res, { message: "Success update data", data: null });

  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.findData;
    const post = req.body;

    post.id = uuid.v4();

    var input = {};
    if (req.file?.photo) {
      input.photo = saveImage(req.file.photo, post.id, "raffle_prize");
    }

    await Models.raffle_prize.update(input, { where: { id: id } });
    Request.success(res, { message: "Success update data", data: null });

  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.remove = async (req, res) => {
  try {
    const data = req.findData;
    await Models.raffle_prize.destroy({
      where: {
        id: data.id,
      },
    });

    Request.success(res, { message: "Success delete data", data });
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.exportData = async (req, res) => {
  try {
    await exportData(req, res);
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};