const { check } = require("express-validator");
const Models = require("@models");
const Request = require("@helper/reguest");
const { validateRequest } = require("@validators/request");
const { checkFile, getDestUploadFile, getFileUrl } = require("@helper/file");

exports.findOneData = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await Models.raffle_prize.findOne({
            where: { id: id },
            attributes: ["id", "name", "photo"],
        });

        if (!data) throw "Not found";

        let result = {
            id: data.id,
            name: data.name,
            photo: data.photo ? getFileUrl('raffle_prize') + data.photo : null,
        };

        req.findData = result;

        next();
    } catch (error) {
        console.log(error);
        Request.notFound(res, error);
    }
};

exports.storeRequest = [
    check("name").notEmpty().bail().isString(),
    checkFile({
        name: "photo",
        required: false,
        allow: ["png", "jpeg", "jpg"],
    }),
    validateRequest,
];
exports.updateRequest = [
    check("name").notEmpty().bail().isString(),
    checkFile({
        name: "photo",
        required: false,
        allow: ["png", "jpeg", "jpg"],
    }),
    validateRequest,
];
exports.updatePhotoRequest = [
    checkFile({
        name: "photo",
        required: false,
        allow: ["png", "jpeg", "jpg"],
    }),
    validateRequest,
];