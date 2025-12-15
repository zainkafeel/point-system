const User = require("../models/User");
const PointLog = require("../models/PointLog");

const ACTION_SETTINGS = {
  WATCH_CHANNEL:   { points: 1, dailyLimit: 1 },
  POST_HOME:       { points: 1, dailyLimit: 4 },
  CHAT_COMMENT:    { points: 1, dailyLimit: 1 },
  SCAN_QR:         { points: 1, dailyLimit: 4 },
  HOME_AD_CLICK:   { points: 1, dailyLimit: 5 },
  CHAT_AD_CLICK:   { points: 1, dailyLimit: 5 },
  ASK_IRIS:        { points: 1, dailyLimit: 5 },
  SPONSOR_SURVEY:  { points: 1, dailyLimit: 3 },
  CREATOR_STREAM:  { points: 1, dailyLimit: 1 },
  DAILY_LOGIN:     { points: 1, dailyLimit: 2 },
  ANSWER_QUIZ:     { points: 1, dailyLimit: 4 }
};

exports.addPoints = async (req, res) => {
  try {
    const { email, action, meta, deviceId } = req.body;
    const ip = req.ip;

    if (!email || !action) {
      return res.status(400).json({
        success: false,
        message: "Email & Action are required"
      });
    }

    const ACTION = action.toUpperCase();
    const settings = ACTION_SETTINGS[ACTION];

    if (!settings) {
      return res.status(400).json({
        success: false,
        message: "Invalid action type"
      });
    }

    // Today start time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check daily limit
    const usageToday = await PointLog.countDocuments({
      email,
      action: ACTION,
      meta: meta,       // full exact match
      createdAt: { $gte: today }
    });

    if (usageToday >= settings.dailyLimit) {
      return res.status(429).json({
        success: false,
        message: `Daily limit reached for ${ACTION}`
      });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
    }

    // Add points
    user.points += settings.points;
    await user.save();

    // Log action
    await PointLog.create({
      email,
      action: ACTION,
      points: settings.points,
      meta,
      ip,
      deviceId
    });

    return res.json({
      success: true,
      message: "Points added successfully",
      added: settings.points,
      totalPoints: user.points
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
