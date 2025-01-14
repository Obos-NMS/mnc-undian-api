const { check } = require("express-validator");
const Models = require("@models");
const Request = require("@helper/reguest");
const { validateRequest } = require("@validators/request");
const { checkFile, getDestUploadFile, getFileUrl } = require("@helper/file");

exports.findOneData = async (req, res, next) => {
    try {
        const data = await Models.setting.findOne({
            where: {},
            include: [{
                association: "participant_display_fields",
                attributes: ["id", "index"],
                order: [['index', 'ASC']],
                include: [{
                    association: "participant_field_name",
                    attributes: ["id", "name", "index"],
                }],
            }],
            attributes: [
                "id",
                "title",
                "shuffle_duration",
                "is_repeat_win_allowed",
                "reset_data_password",
                "company_logo",
                "headline_text",
                "headline_supporting_text"
            ],
        });

        let result = {
            id: data?.id,
            title: data?.title,
            shuffle_duration: data?.shuffle_duration,
            participant_display_fields: data?.participant_display_fields,
            is_repeat_win_allowed: data?.is_repeat_win_allowed,
            reset_data_password: data?.reset_data_password,
            company_logo: data?.company_logo ? getFileUrl('company_logo') + data.company_logo : null,
            headline_text: data?.headline_text,
            headline_supporting_text: data?.headline_supporting_text,
        };

        req.findData = result;

        next();
    } catch (error) {
        console.log(error);
        Request.notFound(res, error);
    }
};

exports.updateRequest = [
    check("title").notEmpty().bail().isString(),
    check("shuffle_duration").notEmpty().bail().isNumeric(),
    check("is_repeat_win_allowed").notEmpty().bail().isBoolean(),
    check("reset_data_password").notEmpty().bail().isString(),
    checkFile({
        name: "company_logo",
        required: false,
        allow: ["png", "jpeg", "jpg"],
    }),
    check("headline_text").optional({ nullable: true }).isString(),
    check("headline_supporting_text").optional({ nullable: true }).isString(),
    check('participant_display_fields.*.participant_field_name_id').notEmpty().bail().isString(),
    check('participant_display_fields.*.index').notEmpty().bail().isNumeric(),
    validateRequest,
];