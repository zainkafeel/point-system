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
    // For DAILY_LOGIN, ignore meta differences
    let query = {
      email,
      action: ACTION,
      createdAt: { $gte: today }
    };

    // Optional: only ignore meta for certain actions
    if (ACTION !== "DAILY_LOGIN" && ACTION !== "POST_HOME") {
      query.meta = meta;  // match full meta for other actions
    }

    // Check daily limit
    const usageToday = await PointLog.countDocuments(query);

    console.log(`Usage today for ${email} on action ${ACTION}: ${usageToday}`, 'limit:', settings.dailyLimit);
    if (usageToday >= settings.dailyLimit) {
      console.log('limit exceeded');  
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


exports.getPointsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email }).select("email points");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      email: user.email,
      points: user.points
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getPointsHistoryByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const logs = await PointLog.find({ email })
      .sort({ createdAt: -1 }) // DESC order
      .limit(Number(limit))
      .skip(Number(skip))
      .select("action points meta deviceId ip createdAt");

    return res.json({
      success: true,
      email,
      count: logs.length,
      logs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
