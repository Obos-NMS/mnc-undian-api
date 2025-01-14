const Models = require("@models");
const { getDestUploadFile, getFileUrl } = require("@helper/file");
const { Op, Sequelize } = require("sequelize");
const sequelize = require("sequelize");
const { Workbook } = require("excel4node");
const moment = require("moment");

exports.collections = async (req, res) => {
    const { page = 1, page_size = 10, search, raffle_prize_id = null, status = null } = req.query;
    const offset = (page - 1) * page_size;
    const numberPage = Number(page);
    const where = { [Op.and]: [] };
    const query = {
        attributes: ["id", "status", "created_at", "updated_at"],
        where: where,
        include: [
            {
                association: "participant",
                include: [{
                    association: "participant_field_values",
                    attributes: ["id", "value"],
                    include: [{
                        association: "participant_field_name",
                        attributes: ["id", "name", "index"],
                    }],
                }],
                attributes: ["id", "raffle_code", "identifier_code", "created_at", "updated_at"],
            },
            {
                association: "raffle_prize",
                attributes: ["id", "name", "photo", "created_at", "updated_at"],
            },
        ],
        limit: page_size,
        offset: offset,
        order: [['created_at', 'DESC']],
        distinct: true,
    };


    if (status) {
        where[Op.and].push({ status: status })
    }

    if (raffle_prize_id) {
        where[Op.and].push({ raffle_prize_id: raffle_prize_id })
    }

    if (search) {
        where[Op.and].push({
            [Op.or]: [
                sequelize.literal(`EXISTS (
                SELECT * FROM participants AS participant
                WHERE \`winner\`.\`participant_id\` = participant.id
                AND (participant.raffle_code LIKE '%${search}%' OR participant.identifier_code LIKE '%${search}%')
              )`),
                sequelize.literal(`EXISTS (
                SELECT * FROM participant_field_values AS participant_field_value
                WHERE \`winner\`.\`participant_id\` = participant_field_value.participant_id
                AND participant_field_value.value LIKE '%${search}%'
                AND EXISTS (
                    SELECT * FROM participant_display_fields as participant_display_field
                    WHERE participant_display_field.participant_field_name_id = participant_field_value.participant_field_name_id
                )
              )`),
            ]
        });
    }

    const data = await Models.winner.findAndCountAll(query);
    const participants = data.rows.map((e) => {
        if (e.raffle_prize && e.raffle_prize.photo) {
            e.raffle_prize.photo = e.raffle_prize.photo ? getFileUrl('raffle_prize') + e.raffle_prize.photo : null
        }

        let result = {
            id: e.id,
            status: e.status,
            participant: e.participant,
            raffle_prize: e.raffle_prize,
            identifier_code: e.identifier_code,
            created_at: e.created_at,
            updated_at: e.updated_at,
        };

        return result;
    });

    const display_fields = await Models.participant_display_field.findAll({
        attributes: ["id", "index"],
        include: [{
            association: "participant_field_name",
            attributes: ["id", "name", "index"],
        }],
        order: [["index", "ASC"]],
    });

    const total = data.count;
    const totalPage = Math.ceil(data.count / page_size);

    return {
        data: {
            participants: participants,
            display_fields: display_fields
        },
        totalPage: totalPage,
        meta: {
            current_page: numberPage,
            prev_page: numberPage === 1 ? null : numberPage - 1,
            next_page:
                numberPage === totalPage || total <= totalPage ? null : numberPage + 1,
            total_page: totalPage || 1,
            total: total,
        },
    };
};

exports.exportData = async (req, res) => {
    const { search, raffle_prize_id = null, status = null } = req.query;

    const where = { [Op.and]: [] };
    const query = {
        attributes: ["id", "status", "created_at", "updated_at"],
        where: where,
        include: [
            {
                association: "participant",
                include: [{
                    association: "participant_field_values",
                    attributes: ["id", "value"],
                    include: [{
                        association: "participant_field_name",
                        attributes: ["id", "name", "index"],
                    }],
                }],
                attributes: ["id", "raffle_code", "identifier_code", "created_at", "updated_at"],
            },
            {
                association: "raffle_prize",
                attributes: ["id", "name", "photo", "created_at", "updated_at"],
            },
        ],
        distinct: true,
        order: [['created_at', 'DESC']],
    };


    if (status) {
        where[Op.and].push({ status: status })
    }

    if (raffle_prize_id) {
        where[Op.and].push({ raffle_prize_id: raffle_prize_id })
    }

    if (search) {
        where[Op.and].push({
            [Op.or]: [
                sequelize.literal(`EXISTS (
                SELECT * FROM participants AS participant
                WHERE \`winner\`.\`participant_id\` = participant.id
                AND (participant.raffle_code LIKE '%${search}%' OR OR participant.identifier_code LIKE '%${search}%')
              )`),
                sequelize.literal(`EXISTS (
                SELECT * FROM participant_field_values AS participant_field_value
                WHERE \`winner\`.\`participant_id\` = participant_field_value.participant_id
                AND participant_field_value.value LIKE '%${search}%'
                AND EXISTS (
                    SELECT * FROM participant_display_fields as participant_display_field
                    WHERE participant_display_field.participant_field_name_id = participant_field_value.participant_field_name_id
                )
              )`),

            ]
        });
    }

    const display_fields = await Models.participant_display_field.findAll({
        attributes: ["id", "index"],
        include: [{
            association: "participant_field_name",
            attributes: ["id", "name", "index"],
        }],
        order: [["index", "ASC"]],
    });

    const data = await Models.winner.findAndCountAll(query);
    const winners = data.rows.map((e) => {
        let result = { 'Nomor': e.participant.raffle_code, "Kode unik undian": e.participant.identifier_code };
        for (let i = 0; i < e.participant.participant_field_values.length; i++) {
            const element = e.participant.participant_field_values[i];
            if (display_fields.some((df) => df.participant_field_name.id == element.participant_field_name.id)) {
                result[element.participant_field_name.name] = element.value;
            }
        }

        result['Hadiah'] = e.raffle_prize.name;
        result['Tanggal pengundian'] = e.created_at && moment(e.created_at).format('DD MMM YYYY, HH:mm');

        return result;
    });

    const field_names = await Models.participant_field_name.findAll({
        attributes: ["id", "name", "index"],
        order: [['index', 'ASC']]
    });

    var workbook = new Workbook();
    var worksheet = workbook.addWorksheet("Pemenang");

    const headerOverlayActivitys = [
        "Nomor", "Kode unik undian", 
        ...field_names.filter((e) => display_fields.some((df) => df.participant_field_name.id == e.id)).map(element => element.name),
        'Hadiah', 'Tanggal pengundian'
    ];

    headerOverlayActivitys.map((key, index) => {
        worksheet.cell(1, index + 1).string(key);
    });

    winners.map((value, index) => {
        Object.values(value).forEach((cellValue, counter) => {
            worksheet.cell(index + 2, counter + 1).string(cellValue);
        });
    });

    workbook.write("export-pemenang .xlsx", res);
};
