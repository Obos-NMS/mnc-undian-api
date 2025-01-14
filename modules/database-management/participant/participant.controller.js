const Models = require("@models");
const Request = require("@helper/reguest");
const { collections, exampleData, exportData } = require("./participant.repositories");

const uuid = require("uuid");

exports.index = async (req, res) => {
  try {
    Request.success(res, await collections(req, res));
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.exampleData = async (req, res) => {
  try {
    await exampleData(req, res);
  } catch (error) {
    Request.error(res, error);
  }
};

exports.resetData = async (req, res) => {
  try {
    const post = req.body;
    const setting = await Models.setting.findOne({
      where: { reset_data_password: post.reset_data_password },
    })

    if (!setting) throw 'Password not name';
    await Models.participant_display_field.destroy({ where: {} });
    await Models.participant_field_value.destroy({ where: {} });
    await Models.participant_field_name.destroy({ where: {} });
    await Models.participant.destroy({ where: {} });

    Request.success(res, { message: "Success reset data", });
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

exports.importData = async (req, res) => {
  try {
    const { participants, column_participants } = req.body;
    let socket_name = uuid.v4();
    if (!participants?.length) throw "Data is empty";

    // console.log(JSON.stringify(participants));

    const startImport = async () => {
      let success = 0;
      let failed = [];
      let lastProgess = null;

      // await Models.participant_display_field.destroy({ where: {} });
      // await Models.participant_field_value.destroy({ where: {} });
      // await Models.participant_field_name.destroy({ where: {} });
      // await Models.participant.destroy({ where: {} });
      // await Models.winner.destroy({ where: {} });

      const field_names = await Models.participant_field_name.findAll({
        attributes: ["id", "name", "index"],
        order: [['index', 'ASC']]
      });

      // add participant field name
      let participantFieldNames = field_names;
      let counterFieldName = field_names.length;
      const filterColumFieldName = column_participants.filter((e) => !(e.toLowerCase() == 'nomor' || e.toLowerCase() == 'kode unik undian'));
      for (let i = 0; i < filterColumFieldName.length; i++) {
        if (!field_names.some((e) => e.name == filterColumFieldName[i])) {
          var input = { index: counterFieldName, name: filterColumFieldName[i] };
          participantFieldNames.push(await Models.participant_field_name.create(input));
          counterFieldName++;
        }
      }

      const participantCodes = await Models.participant.findAll({
        attributes: ["id", "raffle_code"],
        where: {},
      });

      let processedRaffleCodes = new Set();
      participantCodes.forEach(participant => {
        processedRaffleCodes.add(participant.raffle_code);
      });

      for (let i = 0; i < participants.length; i++) {
        const element = participants[i];
        element.errors = [];

        // const keys = Object.keys(element);
        // const noUndianValue = element[keys[0]];
        // const cifValue = element[keys[1]];
        const noUndianValue = element['Nomor'];
        const identifierCode = element['Kode unik undian'];

        if (!noUndianValue) element.errors.push(`Nomor is required`);
        // Check if the raffle number has already been processed
        if (processedRaffleCodes.has(noUndianValue)) {
          element.errors.push(`Nomor ${noUndianValue} is duplicated`);
        } else {
          processedRaffleCodes.add(noUndianValue);
        }

        const alphanumericRegex = /^[a-zA-Z0-9]{9}$/;
        if (!identifierCode) element.errors.push(`Kode unik undian is required`);
        if (!alphanumericRegex.test(identifierCode)) element.errors.push(`Kode unik undian is invalid format`);

        if (!element.errors.length) {
          // add participant
          var inputParticipant = { raffle_code: noUndianValue, identifier_code: identifierCode };
          const newParticipant = await Models.participant.create(inputParticipant);
          // add participant field value
          const valueHasParticipantFieldValues = Object.entries(element)
            .filter(([key, value]) => key.toLowerCase() !== 'nomor' && key.toLowerCase() !== 'kode unik undian' && key.toLowerCase() !== 'errors')
            .map(([key, value], index) => {
              const participantFieldName = participantFieldNames.find((e) => e.name == key);
              return ({
                participant_id: newParticipant.id,
                participant_field_name_id: participantFieldName.id,
                value: value,
              })
            });

          await Models.participant_field_value.bulkCreate(valueHasParticipantFieldValues);

        }

        if (!element.errors.length) success += 1;
        else {
          element.errors = element.errors.join(", ");
          failed.push(element);
        }
        let progress = Math.ceil((i / participants.length) * 100);

        if (lastProgess != progress) {
          lastProgess = progress;
          io.of("/v1").emit("upload-" + socket_name, {
            progress: progress,
          });
        }
      }

      console.log("Success : ", success);
      console.log("Failed : ", failed.length);

      io.of("/v1").emit("upload-" + socket_name, {
        progress: 100,
      });
      setTimeout(() => {
        io.of("/v1").emit("result-" + socket_name, {
          result: { success, failed },
        });
      }, 1000);
    };

    startImport().catch(console.error);
    Request.success(res, {
      message: "Success import data",
      data: {
        progress: "upload-" + socket_name,
        result: "result-" + socket_name,
      },
    });
  } catch (error) {
    Request.error(res, error);
  }
}
