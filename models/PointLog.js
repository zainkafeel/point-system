const mongoose = require("mongoose");

const pointLogSchema = new mongoose.Schema(
  {
    email: String,
    action: String,
    points: Number,
    meta: Object,
    ip: String,
    deviceId: String,
    token: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PointLog", pointLogSchema);
