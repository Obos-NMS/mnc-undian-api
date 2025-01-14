const express = require("express");
const router = express.Router();

const { index, exampleData, importData, exportData, resetData } = require("./participant.controller");
const { importRequest, resetRequest } = require("./participant.middleware");

router.get("/", index);
router.get("/example", exampleData);
router.post("/import", importRequest, importData);
router.post("/reset", resetRequest, resetData);
router.get("/export", exportData);

module.exports = router;