const express = require("express");
const router = express.Router();

router.use("/raffle-prize", require("../database-management/raffle-prize/raffle-prize.routes"));
router.use("/participant", require("../database-management/participant/participant.routes"));

module.exports = router;