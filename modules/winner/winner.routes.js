const express = require("express");
const router = express.Router();

const {
  index,
  getMultipleWinner,
  getRandomWinner,
  setWinner,
  setMultipleWinner,
  setStatus,
  remove,
  resetData,
  exportData,
} = require("./winner.controller");
const {
  setWinnerRequest,
  setStatusRequest,
  resetRequest,
  findOneData,
} = require("./winner.middleware");

router.get("/", index);
router.post("/get-random-winner", getRandomWinner);
router.post("/get-multiple-winner/:count", getMultipleWinner);
router.post("/set-winner", setWinnerRequest, setWinner);
router.post("/set-multiple-winner", setMultipleWinner);
router.patch("/:id/set-status", findOneData, setStatusRequest, setStatus);
router.delete("/:id", findOneData, remove);

router.post("/reset", resetRequest, resetData);
router.get("/export", exportData);

module.exports = router;
