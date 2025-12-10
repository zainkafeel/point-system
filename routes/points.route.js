const express = require("express");
const router = express.Router();

const { addPoints } = require("../controllers/points.controllers");

router.post("/add", addPoints);

module.exports = router;
