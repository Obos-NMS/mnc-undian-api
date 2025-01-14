const { check } = require("express-validator");
const { checkFile, readFileExcel } = require("@helper/file");
const { validateRequest } = require("@validators/request");

exports.importRequest = [
    checkFile({
        name: "participants",
        allow: ["vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
        multi: false,
        required: true,
    }),
    readFileExcel("participants"),
];

exports.resetRequest = [
    check("reset_data_password").notEmpty().bail().isString(),
    validateRequest,
];