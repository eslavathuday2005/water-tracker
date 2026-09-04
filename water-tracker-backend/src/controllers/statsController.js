const User = require('../models/User');
const IntakeLog = require('../models/IntakeLog');
const SystemConfig = require('../models/SystemConfig');
const { DEFAULT_DAILY_GOAL } = require('../config/env');

const getFormattedDate = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Admin: Get overall usage and platform statistics
// @route   GET /api/stats/overview
// @access  Private (Admin only)
const getAdminOverview = async (req, res, next) => {
  try {
    const todayStr = getFormattedDate();

    // Total users count
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Total logs
    const totalLogs = await IntakeLog.countDocuments();

    // All-time water intake
    const allLogs = await IntakeLog.find();
    const totalWaterLoggedAllTime = allLogs.reduce((acc, log) => acc + log.amount, 0);

    // Today's logs
    const todayLogs = await IntakeLog.find({ date: todayStr });
    const totalWaterLoggedToday = todayLogs.reduce((acc, log) => acc + log.amount, 0);

    // Active users today (unique user IDs with logs today)
    const activeUserIdsToday = new Set(todayLogs.map((log) => log.user.toString()));
    const activeUsersTodayCount = activeUserIdsToday.size;

    // Platform average daily intake per user
    const avgIntakePerUser = totalUsers > 0 ? Math.round(totalWaterLoggedAllTime / totalUsers) : 0;

    // System config
    let systemConfig = await SystemConfig.findOne({ key: 'system_settings' });
    if (!systemConfig) {
      systemConfig = await SystemConfig.create({
        key: 'system_settings',
        defaultDailyGoal: DEFAULT_DAILY_GOAL
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalLogs,
        totalWaterLoggedAllTime,
        totalWaterLoggedToday,
        activeUsersTodayCount,
        avgIntakePerUser,
        defaultDailyGoal: systemConfig.defaultDailyGoal,
        systemSettings: systemConfig
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update system default daily water intake goal
// @route   PUT /api/stats/system-goal
// @access  Private (Admin only)
const updateSystemGoal = async (req, res, next) => {
  try {
    const { defaultDailyGoal } = req.body;
    const goalNumber = Number(defaultDailyGoal);

    if (isNaN(goalNumber) || goalNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Default daily goal must be a positive number greater than 0'
      });
    }

    const config = await SystemConfig.findOneAndUpdate(
      { key: 'system_settings' },
      {
        defaultDailyGoal: goalNumber,
        updatedBy: req.user.id
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Default daily water intake goal updated to ${goalNumber}ml`,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system-wide default daily goal
// @route   GET /api/stats/system-goal
// @access  Public
const getSystemGoal = async (req, res, next) => {
  try {
    let config = await SystemConfig.findOne({ key: 'system_settings' });
    const defaultGoal = config ? config.defaultDailyGoal : DEFAULT_DAILY_GOAL;

    res.status(200).json({
      success: true,
      data: {
        defaultDailyGoal: defaultGoal
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminOverview,
  updateSystemGoal,
  getSystemGoal
};
