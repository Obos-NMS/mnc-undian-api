const Models = require("@models");
const { getDestUploadFile, getFileUrl } = require("@helper/file");
const { Op } = require("sequelize");
const { Workbook } = require("excel4node");

exports.collections = async (req, res) => {
    const { page = 1, page_size = 10, search } = req.query;
    const offset = (page - 1) * page_size;
    const numberPage = Number(page);
    const where = {};
    const query = {
        attributes: ["id", "name", "photo", "created_at", "updated_at"],
        where: where,
        limit: page_size,
        offset: offset,
    };

    if (search) {
        where.name = {
            [Op.like]: `%${search}%`,
        };
    }

    const data = await Models.raffle_prize.findAndCountAll(query);
    const lotterys = data.rows.map((e) => {
        let result = {
            id: e.id,
            name: e.name,
            photo: e.photo ? getFileUrl('raffle_prize') + e.photo : null,
            created_at: e.created_at,
            updated_at: e.updated_at,
        };

        return result;
    });
    const total = data.count;
    const totalPage = Math.ceil(data.count / page_size);

    return {
        data: lotterys,
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
    const { search } = req.query;

    const where = {};
    const query = {
        attributes: ["id", "name"],
        where: where,
    };

    if (search) {
        where.name = {
            [Op.like]: `%${search}%`,
        };
    }

    const data = await Models.raffle_prize.findAndCountAll(query);
    const lotterys = data.rows.map((e) => {
        let result = { id: e.id, name: e.name };

        return result;
    });

    var workbook = new Workbook();
    var worksheet = workbook.addWorksheet("Hadiah undian");

    const headerOverlayActivitys = ["Nama hadiah"];
    headerOverlayActivitys.map((key, index) => {
        worksheet.cell(1, index + 1).string(key);
    });
    lotterys.map((value, index) => {
        worksheet.cell(index + 2, 1).string(value.name);
    });

    workbook.write("export-hadiah-undian .xlsx", res);
};
