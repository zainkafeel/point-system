const express = require("express");
const router = express.Router();

const { addPoints, getPointsByEmail, getPointsHistoryByEmail } = require("../controllers/points.controllers");

router.post("/add", addPoints);

router.get("/:email", getPointsByEmail);
// GET /api/points/:email/history
router.get("/:email/history", getPointsHistoryByEmail);

module.exports = router;
