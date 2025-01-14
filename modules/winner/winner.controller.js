const Models = require("@models");
const Request = require("@helper/reguest");

const { collections, exportData } = require("./winner.repositories");
const { Op, } = require("sequelize");
const sequelize = require("sequelize");

exports.index = async (req, res) => {
  try {
    Request.success(res, await collections(req, res));
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.getRandomWinner2 = async (req, res) => {
  try {
    const setting = await Models.setting.findOne({
      where: {},
      attributes: ["id", "is_repeat_win_allowed"],
    });

    const where = { [Op.and]: [] };
    if (!setting?.is_repeat_win_allowed) {
      where[Op.and].push(
        sequelize.literal(`NOT EXISTS (
          SELECT * FROM winners AS w
              LEFT JOIN participants p2 ON w.participant_id = p2.id
              WHERE p2.identifier_code = \`participant\`.\`identifier_code\`
        )`)
      );
    }

    const participants = await Models.participant.findAll({
      attributes: [
        'id',
        'identifier_code',
        [sequelize.fn('COUNT', sequelize.col('identifier_code')), 'entry_count']
      ],
      where,
      group: ['identifier_code'],
      raw: true
    });

    if (!participants.length) {
      let counterParticipant = await Models.participant.count();
      return Request.error(res, counterParticipant ? "Peserta sudah menang semua" : "Peserta tidak tersedia");
    }

    const totalEntries = participants.reduce((sum, p) => sum + parseInt(p.entry_count), 0);
    let random = Math.floor(Math.random() * totalEntries);

    let selectedParticipant;
    for (const participant of participants) {
      random -= participant.entry_count;
      if (random < 0) {
        selectedParticipant = participant;
        break;
      }
    }

    const data = await Models.participant.findOne({
      where: { identifier_code: selectedParticipant.identifier_code },
      attributes: [
        "id",
        "raffle_code",
        "identifier_code",
        "created_at",
        "updated_at",
        [sequelize.literal(`(SELECT COUNT(*) FROM participants WHERE identifier_code = participant.identifier_code)`), 'total_entries']
      ],
      include: [{
        association: "participant_field_values",
        attributes: ["id", "value"],
        include: [{
          association: "participant_field_name",
          attributes: ["id", "name", "index"],
        }],
        order: [["participant_field_name", "index", "ASC"]]
      }]
    });

    if (data) {
      const result = {
        participant_id: data.id,
        raffle_code: data.raffle_code,
        identifier_code: data.identifier_code,
        participant_field_values: data.participant_field_values,
        total_entries: data.get('total_entries'),
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      Request.success(res, { message: "success", data: result });
    } else {
      Request.error(res, "Peserta tidak ditemukan");
    }
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.getRandomWinner = async (req, res) => {
  try {
    const setting = await Models.setting.findOne({
      where: {},
      attributes: ["id", "is_repeat_win_allowed"],
    });

    const where = { [Op.and]: [] };
    if (setting && setting.is_repeat_win_allowed) {
    } else {
      where[Op.and].push(sequelize.literal(`NOT EXISTS (
          SELECT * FROM winners AS w
              LEFT JOIN participants p2 ON w.participant_id = p2.id
              WHERE p2.identifier_code = \`participant\`.\`identifier_code\`
        )`
      ))
    }

    const query = {
      attributes: ["id", "raffle_code", "identifier_code", "created_at", "updated_at"],
      where: where,
      include: [{
        association: "participant_field_values",
        attributes: ["id", "value"],
        include: [{
          association: "participant_field_name",
          attributes: ["id", "name", "index"],
          order: [[]]
        }],
        order: [["participant_field_name", "index", "ASC"]]
      }],
      order: [sequelize.fn("RAND")],
    };

    const data = await Models.participant.findOne(query);
    if (data) {
      let result = {
        participant_id: data.id,
        raffle_code: data.raffle_code,
        identifier_code: data.identifier_code,
        participant_field_values: data.participant_field_values,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      Request.success(res, { message: "success", data: result });
    } else {
      let counterParticipant = await Models.participant.count();
      if (counterParticipant) {
        Request.error(res, 'Peserta sudah menang semua');
      } else {
        Request.error(res, 'Peserta tidak tersedia');
      }
    }

  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

// exports.getRandomWinner = async (req, res) => {
//   try {
//     const setting = await Models.setting.findOne({
//       where: {},
//       attributes: ["id", "is_repeat_win_allowed"],
//     });

//     const where = { [Op.and]: [] };

//     // If repeat winners not allowed, exclude previous winners by identifier_code
//     if (!setting?.is_repeat_win_allowed) {
//       where[Op.and].push(sequelize.literal(`NOT EXISTS (
//         SELECT 1 FROM winners w 
//         INNER JOIN participants wp ON w.participant_id = wp.id
//         WHERE wp.identifier_code = participant.identifier_code
//       )`));
//     }

//     // Get all eligible participants with their entry count
//     const participants = await Models.participant.findAll({
//       attributes: [
//         'identifier_code',
//         [sequelize.fn('COUNT', sequelize.col('id')), 'entry_count'],
//         [sequelize.fn('MIN', sequelize.col('id')), 'first_id'], // Get one ID to reference
//         [sequelize.fn('GROUP_CONCAT', sequelize.col('raffle_code')), 'raffle_codes']
//       ],
//       where,
//       group: ['identifier_code'],
//       raw: true
//     });

//     if (!participants.length) {
//       const totalCount = await Models.participant.count();
//       return Request.error(res, totalCount ? 'Peserta sudah menang semua' : 'Peserta tidak tersedia');
//     }

//     // Calculate total entries for weighted selection
//     const totalEntries = participants.reduce((sum, p) => sum + parseInt(p.entry_count), 0);
//     let random = Math.floor(Math.random() * totalEntries);

//     // Select winner using weighted random
//     let winner;
//     for (const participant of participants) {
//       random -= participant.entry_count;
//       if (random < 0) {
//         winner = participant;
//         break;
//       }
//     }

//     // Get full winner data
//     const winnerData = await Models.participant.findOne({
//       where: { id: winner.first_id },
//       attributes: [
//         "id",
//         "raffle_code",
//         "identifier_code",
//         [sequelize.literal(`(SELECT COUNT(*) FROM participants WHERE identifier_code = participant.identifier_code)`), 'total_entries']
//       ],
//       include: [{
//         association: "participant_field_values",
//         attributes: ["id", "value"],
//         include: [{
//           association: "participant_field_name",
//           attributes: ["id", "name", "index"],
//         }],
//         order: [["participant_field_name", "index", "ASC"]]
//       }]
//     });

//     Request.success(res, {
//       message: "success",
//       data: {
//         participant_id: winnerData.id,
//         raffle_code: winnerData.raffle_code,
//         identifier_code: winnerData.identifier_code,
//         participant_field_values: winnerData.participant_field_values,
//         total_entries: winnerData.get('total_entries'),
//         created_at: winnerData.created_at,
//         updated_at: winnerData.updated_at
//       }
//     });

//   } catch (error) {
//     console.log(error);
//     Request.error(res, error);
//   }
// };

// exports.getMultipleWinner = async (req, res) => {
//   try {
//     const totalWinners = parseInt(req.params.count) || 1;
//     const setting = await Models.setting.findOne({
//       where: {},
//       attributes: ["id", "is_repeat_win_allowed"],
//     });

//     const where = { [Op.and]: [] };
//     if (!setting?.is_repeat_win_allowed) {
//       where[Op.and].push(sequelize.literal(`NOT EXISTS (
//         SELECT 1 FROM winners w 
//         INNER JOIN participants wp ON w.participant_id = wp.id
//         WHERE wp.identifier_code = participant.identifier_code
//       )`));
//     }

//     // Get all eligible participants with their entry counts
//     const participants = await Models.participant.findAll({
//       attributes: [
//         'identifier_code',
//         [sequelize.fn('COUNT', sequelize.col('id')), 'entry_count'],
//         [sequelize.fn('MIN', sequelize.col('id')), 'first_id'],
//         [sequelize.fn('GROUP_CONCAT', sequelize.col('raffle_code')), 'raffle_codes']
//       ],
//       where,
//       group: ['identifier_code'],
//       raw: true
//     });

//     if (!participants.length) {
//       const totalCount = await Models.participant.count();
//       return Request.error(res, totalCount ? 'Peserta sudah menang semua' : 'Peserta tidak tersedia');
//     }

//     // Make sure we don't try to select more winners than available participants
//     const actualWinnerCount = Math.min(totalWinners, participants.length);
//     const winners = [];
//     const selectedIdentifiers = new Set();

//     // Calculate initial total entries
//     let remainingParticipants = [...participants];

//     while (winners.length < actualWinnerCount) {
//       // Recalculate total entries for remaining participants
//       const totalEntries = remainingParticipants.reduce((sum, p) => sum + parseInt(p.entry_count), 0);
//       let random = Math.floor(Math.random() * totalEntries);

//       // Select winner using weighted random
//       let selectedWinner;
//       for (const participant of remainingParticipants) {
//         random -= participant.entry_count;
//         if (random < 0) {
//           selectedWinner = participant;
//           break;
//         }
//       }

//       // Remove selected winner from remaining participants
//       remainingParticipants = remainingParticipants.filter(p =>
//         p.identifier_code !== selectedWinner.identifier_code
//       );

//       // Get full winner data
//       const winnerData = await Models.participant.findOne({
//         where: { id: selectedWinner.first_id },
//         attributes: [
//           "id",
//           "raffle_code",
//           "identifier_code",
//           "created_at",
//           "updated_at",
//           [sequelize.literal(`(SELECT COUNT(*) FROM participants WHERE identifier_code = participant.identifier_code)`), 'total_entries']
//         ],
//         include: [{
//           association: "participant_field_values",
//           attributes: ["id", "value"],
//           include: [{
//             association: "participant_field_name",
//             attributes: ["id", "name", "index"],
//           }],
//           order: [["participant_field_name", "index", "ASC"]]
//         }]
//       });

//       winners.push({
//         participant_id: winnerData.id,
//         raffle_code: winnerData.raffle_code,
//         identifier_code: winnerData.identifier_code,
//         participant_field_values: winnerData.participant_field_values,
//         total_entries: winnerData.get('total_entries'),
//         created_at: winnerData.created_at,
//         updated_at: winnerData.updated_at
//       });
//     }

//     Request.success(res, {
//       message: "success",
//       data: winners
//     });

//   } catch (error) {
//     console.log(error);
//     Request.error(res, error);
//   }
// };


exports.getMultipleWinner = async (req, res) => {
  try {
    const { count = 1 } = req.params;
    const winnerCount = parseInt(count);
    
    const setting = await Models.setting.findOne({
      where: {},
      attributes: ["id", "is_repeat_win_allowed"],
    });

    const where = { [Op.and]: [] };
    if (setting && !setting.is_repeat_win_allowed) {
      where[Op.and].push(sequelize.literal(`NOT EXISTS (
          SELECT * FROM winners AS w
              LEFT JOIN participants p2 ON w.participant_id = p2.id
              WHERE p2.identifier_code = \participant\.\identifier_code\
        )`));
    }

    const allParticipants = await Models.participant.findAll({
      where: where,
      attributes: ['id', 'identifier_code', 'raffle_code'],
      raw: true
    });

    if (!allParticipants.length) {
      return Request.error(res, 'No participants available');
    }

    const participantMap = allParticipants.reduce((acc, p) => {
      if (!acc[p.identifier_code]) {
        acc[p.identifier_code] = {
          entries: [],
          count: 0
        };
      }
      acc[p.identifier_code].entries.push(p);
      acc[p.identifier_code].count++;
      return acc;
    }, {});

    let weightedArray = [];
    Object.entries(participantMap).forEach(([identifier_code, data]) => {
      for (let i = 0; i < data.count; i++) {
        weightedArray.push(identifier_code);
      }
    });

    const winners = new Set();
    while (winners.size < winnerCount && weightedArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * weightedArray.length);
      const selectedIdentifier = weightedArray[randomIndex];
      
      if (!winners.has(selectedIdentifier)) {
        winners.add(selectedIdentifier);
      }
      
      if (!setting.is_repeat_win_allowed) {
        weightedArray = weightedArray.filter(id => id !== selectedIdentifier);
      }
    }

    const results = await Promise.all([...winners].map(async identifier_code => {
      const entries = participantMap[identifier_code].entries;
      const randomEntry = entries[Math.floor(Math.random() * entries.length)];
      
      const participant = await Models.participant.findByPk(randomEntry.id, {
        include: [{
          association: "participant_field_values",
          attributes: ["id", "value"],
          include: [{
            association: "participant_field_name",
            attributes: ["id", "name", "index"],
          }],
          order: [["participant_field_name", "index", "ASC"]]
        }],
      });

      return {
        participant_id: participant.id,
        raffle_code: participant.raffle_code,
        identifier_code: participant.identifier_code,
        participant_field_values: participant.participant_field_values,
        created_at: participant.created_at,
        updated_at: participant.updated_at,
        total_entries: participantMap[identifier_code].count 
      };
    }));

    Request.success(res, {
      message: "success",
      data: results,
      total_winners: results.length
    });
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.getMultipleWinnerOLD = async (req, res) => {
  try {
    const { count = 1 } = req.params;
    const winnerCount = parseInt(count);

    const setting = await Models.setting.findOne({
      where: {},
      attributes: ["id", "is_repeat_win_allowed"],
    });

    const where = { [Op.and]: [] };
    if (setting && !setting.is_repeat_win_allowed) {
      where[Op.and].push(sequelize.literal(`NOT EXISTS (
          SELECT * FROM winners AS w
              LEFT JOIN participants p2 ON w.participant_id = p2.id
              WHERE p2.identifier_code = \`participant\`.\`identifier_code\`
        )`));
    }

    const allPotentialWinners = await Models.participant.findAll({
      attributes: ["id", "raffle_code", "identifier_code", "created_at", "updated_at"],
      where: where,
      // include: [{
      //   association: "participant_field_values",
      //   attributes: ["id", "value"],
      //   include: [{
      //     association: "participant_field_name",
      //     attributes: ["id", "name", "index"],
      //   }],
      //   order: [["participant_field_name", "index", "ASC"]]
      // }],
      order: [sequelize.literal('RAND()')],
    });

    if (!allPotentialWinners.length) {
      let counterParticipant = await Models.participant.count();
      if (counterParticipant) {
        return Request.error(res, 'All participants have already won');
      } else {
        return Request.error(res, 'No participants available');
      }
    }

    // filter supaya orang tidak menang 2x dalam roll yg sama
    const winners = [];
    const seenIdentifierCodes = new Set();

    for (const participant of allPotentialWinners) {
      if (!seenIdentifierCodes.has(participant.identifier_code)) {
        winners.push(participant);
        seenIdentifierCodes.add(participant.identifier_code);

        if (winners.length === winnerCount) break;
      }
    }

    console.info("winners", winners);


    // const results = winners.map(data => ({
    //   participant_id: data.id,
    //   raffle_code: data.raffle_code,
    //   identifier_code: data.identifier_code,
    //   participant_field_values: data.participant_field_values,
    //   created_at: data.created_at,
    //   updated_at: data.updated_at,
    // }));

    const results = await Promise.all(winners.map(async data => {
      await data.reload({
        include: [{
          association: "participant_field_values",
          attributes: ["id", "value"],
          include: [{
            association: "participant_field_name",
            attributes: ["id", "name", "index"],
          }],
          order: [["participant_field_name", "index", "ASC"]]
        }],
      })
      return {
        participant_id: data.id,
        raffle_code: data.raffle_code,
        identifier_code: data.identifier_code,
        participant_field_values: data.participant_field_values,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }
    }))
    // console.log("results", results);

    Request.success(res, {
      message: "success",
      data: results,
      total_winners: results.length
    });

  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.getMultipleWinnerDUPE = async (req, res) => {
  try {
    const { count = 1 } = req.params;
    const winnerCount = parseInt(count);

    const setting = await Models.setting.findOne({
      where: {},
      attributes: ["id", "is_repeat_win_allowed"],
    });

    const where = { [Op.and]: [] };
    if (setting && !setting.is_repeat_win_allowed) {
      where[Op.and].push(sequelize.literal(`NOT EXISTS (
          SELECT * FROM winners AS w
              LEFT JOIN participants p2 ON w.participant_id = p2.id
              WHERE p2.identifier_code = \`participant\`.\`identifier_code\`
        )`));
    }

    const winners = await Models.participant.findAll({
      attributes: ["id", "raffle_code", "identifier_code", "created_at", "updated_at"],
      where: where,
      include: [{
        association: "participant_field_values",
        attributes: ["id", "value"],
        include: [{
          association: "participant_field_name",
          attributes: ["id", "name", "index"],
        }],
        order: [["participant_field_name", "index", "ASC"]]
      }],
      // order: [sequelize.literal('RAND()')],
      order: [['identifier_code', 'ASC']],
      limit: winnerCount
    });

    if (!winners.length) {
      let counterParticipant = await Models.participant.count();
      if (counterParticipant) {
        return Request.error(res, 'All participants have already won');
      } else {
        return Request.error(res, 'No participants available');
      }
    }

    console.log(winners.map(e => ({
      identifier_code: e.identifier_code,
    })))

    const results = winners.map(data => ({
      participant_id: data.id,
      raffle_code: data.raffle_code,
      identifier_code: data.identifier_code,
      participant_field_values: data.participant_field_values,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }));

    Request.success(res, {
      message: "success",
      data: results,
      total_winners: results.length
    });

  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.setWinner = async (req, res) => {
  try {
    const post = req.body;
    var input = {
      participant_id: post.participant_id,
      raffle_prize_id: post.raffle_prize_id,
      status: post.status,
    };

    const newData = await Models.winner.create(input);
    Request.success(res, { message: "success", data: newData });
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.setMultipleWinner = async (req, res) => {
  try {
    console.log("req", req.body);
    const { participants } = req.body;
    if (!participants || !participants.length) {
      return Request.error(res, "Error Menyimpan Pemenang.");
    }

    const winnerPromises = participants.map(async (participant) => {
      const input = {
        participant_id: participant.participant_id,
        raffle_prize_id: req.body.raffle_prize_id,
        status: "valid",
      };

      return await Models.winner.create(input);
    });

    const newWinners = await Promise.all(winnerPromises);

    Request.success(res, { message: "success", data: newWinners });
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.setStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const post = req.body;
    const data = req.findData;
    var input = {
      status: post.status,
    };

    await Models.winner.update(input, { where: { id: id } });
    Request.success(res, { message: "Success update data", data: null });
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.remove = async (req, res) => {
  try {
    const data = req.findData;
    await Models.winner.destroy({
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

exports.resetData = async (req, res) => {
  try {
    const post = req.body;
    const setting = await Models.setting.findOne({
      where: { reset_data_password: post.reset_data_password },
    });

    if (!setting) throw "Password not name";
    await Models.winner.destroy({ where: {} });

    Request.success(res, { message: "Success reset data" });
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
