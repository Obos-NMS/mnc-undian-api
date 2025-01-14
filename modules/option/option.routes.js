const express = require("express");
const router = express.Router();

const { rafflePrizeList, participantFieldNameList } = require("./option.controller");

router.get("/raffle-prize-list", rafflePrizeList);
router.get("/participant-field-name-list", participantFieldNameList);
module.exports = router;