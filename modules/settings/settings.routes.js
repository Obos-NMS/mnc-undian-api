const express = require("express");
const router = express.Router();

const { update, show } = require("./settings.controller");
const { updateRequest, findOneData } = require("./settings.middleware");

router.get("/", findOneData, show);
router.post("/", findOneData, updateRequest, update);

module.exports = router;