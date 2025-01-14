const express = require("express");
const router = express.Router();

const { index, store, update, updatePhoto, show, remove, exportData } = require("./raffle-prize.controller");
const { storeRequest, updateRequest, updatePhotoRequest, findOneData } = require("./raffle-prize.middleware");

router.get("/", index);
router.get("/export", exportData);
router.post("/", storeRequest, store);
router.get("/:id", findOneData, show);
router.patch("/:id", findOneData, updateRequest, update);
router.patch("/:id/photo", findOneData, updatePhotoRequest, updatePhoto);
router.delete("/:id", findOneData, remove);

module.exports = router;