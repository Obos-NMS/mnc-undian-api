const express = require("express");
const router = express.Router();

router.use("/settings", require("../modules/settings/settings.routes"));
router.use("/winner", require("../modules/winner/winner.routes"));
router.use("/database-management", require("../modules/database-management/database-management.routes"));
router.use("/option", require("../modules/option/option.routes"));

module.exports = router;