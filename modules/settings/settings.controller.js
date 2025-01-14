const Models = require("@models");
const Request = require("@helper/reguest");
const uuid = require("uuid");
const { getDestUploadFile, getFileUrl, saveImage } = require("@helper/file");

exports.show = async (req, res) => {
  try {
    Request.success(res, { data: req.findData });
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const data = req.findData;
    const post = req.body;

    post.id = uuid.v4();

    var input = {
      title: post.title,
      shuffle_duration: post.shuffle_duration,
      is_repeat_win_allowed: post.is_repeat_win_allowed,
      reset_data_password: post.reset_data_password,
      headline_text: post.headline_text,
      headline_supporting_text: post.headline_supporting_text,
    }

    if (req.file?.company_logo) {
      input.company_logo = saveImage(req.file.company_logo, post.id, "company_logo");
    }

    post.participant_display_fields = JSON.parse(post.participant_display_fields);

    if (data.id) {
      await Models.setting.update(input, { where: { id: data.id } });

      await Models.participant_display_field.destroy({ where: { setting_id: data.id } })
      if (post.participant_display_fields && post.participant_display_fields.length) {
        const valueHasFiels = post.participant_display_fields.map((e) => ({
          setting_id: data.id, participant_field_name_id: e.participant_field_name_id, index: e.index
        }))

        await Models.participant_display_field.bulkCreate(valueHasFiels);
      }

    } else {
      const newSetting = await Models.setting.create(input);

      if (post.participant_display_fields && post.participant_display_fields.length) {
        const valueHasFiels = post.participant_display_fields.map((e) => ({
          setting_id: newSetting.id, participant_field_name_id: e.participant_field_name_id, index: e.index
        }))
        await Models.participant_display_field.bulkCreate(valueHasFiels);
      }
    }

    Request.success(res, { message: "Success update data", data: null });

  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};