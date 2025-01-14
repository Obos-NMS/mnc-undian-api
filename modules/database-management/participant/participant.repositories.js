const Models = require("@models");
const { Op, Sequelize } = require("sequelize");
const sequelize = require("sequelize");
const { Workbook } = require("excel4node");

exports.collections = async (req, res) => {
    const { page = 1, page_size = 10, search } = req.query;
    const offset = (page - 1) * page_size;
    const numberPage = Number(page);
    const where = { [Op.and]: [] };
    const query = {
        attributes: ["id", "raffle_code", "identifier_code", "created_at", "updated_at"],
        where: where,
        include: [{
            association: "participant_field_values",
            attributes: ["id", "value", "participant_field_name_id"],
        }],
        limit: page_size,
        offset: offset,
        distinct: true,
    };

    if (search) {
        where[Op.and].push({
            [Op.or]: [
                { raffle_code: { [Op.like]: `%${search}%` } },
                { identifier_code: { [Op.like]: `%${search}%` } },
                sequelize.literal(`EXISTS (SELECT * FROM participant_field_values AS pfv 
                    WHERE pfv.participant_id = participant.id AND pfv.value LIKE '%${search}%')`),
            ]
        })
    }

    const data = await Models.participant.findAndCountAll(query);
    const participants = data.rows.map((e) => {
        let result = {
            id: e.id,
            identifier_code: e.identifier_code,
            raffle_code: e.raffle_code,
            participant_field_values: e.participant_field_values,
            created_at: e.created_at,
            updated_at: e.updated_at,
        };

        return result;
    });

    const field_names = await Models.participant_field_name.findAll({
        attributes: ["id", "name", "index"],
        order: [['index', 'ASC']]
    });

    const total = data.count;
    const totalPage = Math.ceil(data.count / page_size);

    return {
        data: {
            field_names: field_names,
            participants: participants,
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

exports.exampleData = async (req, res) => {
    var workbook = new Workbook();
    var worksheet = workbook.addWorksheet("Peserta");

    const peserta = [
        "Nomor", //A
        "Kode unik undian", //B
    ];

    peserta.map((key, index) => {
        worksheet.cell(1, index + 1).string(key);
    });

    workbook.write("example-import-peserta.xlsx", res);
};

exports.exportData = async (req, res) => {
    const { search } = req.query;

    const where = { [Op.and]: [] };
    const query = {
        attributes: ["id", "raffle_code", "identifier_code", "created_at", "updated_at"],
        where: where,
        include: [{
            association: "participant_field_values",
            attributes: ["id", "value"],
            include: [{
                association: "participant_field_name",
                attributes: ["id", "name", "index"],
            }],
        }],
    };

    if (search) {
        where[Op.and].push({
            [Op.or]: [
                { raffle_code: { [Op.like]: `%${search}%` } },
                { identifier_code: { [Op.like]: `%${search}%` } },
                sequelize.literal(`EXISTS (SELECT * FROM participant_field_values AS pfv 
                    WHERE pfv.participant_id = participant.id AND pfv.value LIKE '%${search}%')`),
            ]
        })
    }

    const data = await Models.participant.findAndCountAll(query);
    const participants = data.rows.map((e) => {
        let result = { 'Nomor': e.raffle_code, "Kode unik undian": e.identifier_code };
        for (let i = 0; i < e.participant_field_values.length; i++) {
            const element = e.participant_field_values[i];
            result[element.participant_field_name.name] = element.value;
        }

        return result;
    });

    const field_names = await Models.participant_field_name.findAll({
        attributes: ["id", "name", "index"],
        order: [['index', 'ASC']]
    });

    var workbook = new Workbook();
    var worksheet = workbook.addWorksheet("Peserta");

    const headerOverlayActivitys = ["Nomor", "Kode unik undian",
        ...field_names.map(element => element.name)];
    headerOverlayActivitys.map((key, index) => {
        worksheet.cell(1, index + 1).string(key);
    });

    participants.map((value, index) => {
        Object.values(value).forEach((cellValue, counter) => {
            worksheet.cell(index + 2, counter + 1).string(cellValue);
        });
    });

    workbook.write("export-peserta .xlsx", res);
};
