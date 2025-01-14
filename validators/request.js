const { validationResult, matchedData } = require("express-validator");
const Request = require("../helper/reguest");

exports.validateRequest = async (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
        return next();
    }

    let error = result.array()[0];
    console.log("error",error);
    if (error.msg.toLowerCase() == 'invalid value') {
        msg = `${error.path} value is invalid`;
    } else {
        msg = error.msg;
    }

    Request.error(res, msg);
};
