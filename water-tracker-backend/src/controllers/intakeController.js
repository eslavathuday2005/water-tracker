const IntakeLog = require('../models/IntakeLog');
const User = require('../models/User');
const { DEFAULT_DAILY_GOAL } = require('../config/env');

// Helper to get formatted date YYYY-MM-DD
const getFormattedDate = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Log a water intake entry
// @route   POST /api/intake
// @access  Private (User/Admin)
const logIntake = async (req, res, next) => {
  try {
    const { amount, unit, note, date } = req.body;

    // Edge Case: Amount must be greater than 0 (reject 0 or negative values) and at most 10,000ml
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid intake amount. Amount must be a positive number greater than 0.'
      });
    }

    if (parsedAmount > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Intake amount exceeds maximum limit of 10,000ml per entry.'
      });
    }

    // Determine entry date (default to today)
    const logDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getFormattedDate();

    const intakeEntry = await IntakeLog.create({
      user: req.user.id,
      amount: Math.round(parsedAmount),
      unit: unit || 'ml',
      note: note || '',
      date: logDate,
      loggedAt: new Date()
    });

    // Calculate updated today's total
    const todayLogs = await IntakeLog.find({
      user: req.user.id,
      date: logDate
    });

    const totalToday = todayLogs.reduce((sum, item) => sum + item.amount, 0);
    const userGoal = req.user.dailyGoal || DEFAULT_DAILY_GOAL;

    res.status(201).json({
      success: true,
      message: 'Water intake logged successfully',
      data: {
        entry: intakeEntry,
        todaySummary: {
          date: logDate,
          totalAmount: totalToday,
          dailyGoal: userGoal,
          percentage: Math.min(100, Math.round((totalToday / userGoal) * 100)),
          remainingAmount: Math.max(0, userGoal - totalToday),
          isGoalReached: totalToday >= userGoal
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's total intake vs daily goal for logged-in user
// @route   GET /api/intake/today
// @access  Private
const getTodayIntake = async (req, res, next) => {
  try {
    const todayStr = getFormattedDate();
    const user = await User.findById(req.user.id);
    const dailyGoal = (user && user.dailyGoal) ? user.dailyGoal : DEFAULT_DAILY_GOAL;

    const logs = await IntakeLog.find({
      user: req.user.id,
      date: todayStr
    }).sort({ loggedAt: -1 });

    const totalAmount = logs.reduce((sum, item) => sum + item.amount, 0);
    const percentage = dailyGoal > 0 ? Math.min(100, Math.round((totalAmount / dailyGoal) * 100)) : 0;
    const remainingAmount = Math.max(0, dailyGoal - totalAmount);
    const isGoalReached = totalAmount >= dailyGoal;

    res.status(200).json({
      success: true,
      data: {
        date: todayStr,
        totalAmount,
        dailyGoal,
        percentage,
        remainingAmount,
        isGoalReached,
        logsCount: logs.length,
        logs
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get intake history with daily totals and detailed logs
// @route   GET /api/intake/history
// @access  Private
const getIntakeHistory = async (req, res, next) => {
  try {
    const { days = 14, startDate, endDate } = req.query;
    const user = await User.findById(req.user.id);
    const dailyGoal = (user && user.dailyGoal) ? user.dailyGoal : DEFAULT_DAILY_GOAL;

    const query = { user: req.user.id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Fetch logs sorted newest first
    const logs = await IntakeLog.find(query).sort({ date: -1, loggedAt: -1 });

    // Group logs by date
    const dailyMap = {};
    logs.forEach((log) => {
      if (!dailyMap[log.date]) {
        dailyMap[log.date] = {
          date: log.date,
          totalAmount: 0,
          entriesCount: 0,
          dailyGoal,
          logs: []
        };
      }
      dailyMap[log.date].totalAmount += log.amount;
      dailyMap[log.date].entriesCount += 1;
      dailyMap[log.date].logs.push(log);
    });

    const dailyTotals = Object.values(dailyMap)
      .map((day) => ({
        ...day,
        percentage: Math.min(100, Math.round((day.totalAmount / day.dailyGoal) * 100)),
        isGoalReached: day.totalAmount >= day.dailyGoal
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    res.status(200).json({
      success: true,
      data: {
        dailyTotals: dailyTotals.slice(0, Number(days)),
        totalEntries: logs.length,
        logs
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a logged intake entry
// @route   DELETE /api/intake/:id
// @access  Private
const deleteIntake = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await IntakeLog.findById(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Water intake log entry not found'
      });
    }

    // Edge Case: User tries to delete an entry that doesn't belong to them
    if (log.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete another user’s intake entry'
      });
    }

    await IntakeLog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Intake log entry deleted successfully',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: View any user's water intake history
// @route   GET /api/intake/user/:userId
// @access  Private (Admin only)
const getUserIntakeHistoryAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    const logs = await IntakeLog.find({ user: userId }).sort({ date: -1, loggedAt: -1 });

    const dailyMap = {};
    logs.forEach((log) => {
      if (!dailyMap[log.date]) {
        dailyMap[log.date] = {
          date: log.date,
          totalAmount: 0,
          entriesCount: 0,
          dailyGoal: targetUser.dailyGoal || DEFAULT_DAILY_GOAL,
          logs: []
        };
      }
      dailyMap[log.date].totalAmount += log.amount;
      dailyMap[log.date].entriesCount += 1;
      dailyMap[log.date].logs.push(log);
    });

    const dailyTotals = Object.values(dailyMap).map((day) => ({
      ...day,
      percentage: Math.min(100, Math.round((day.totalAmount / day.dailyGoal) * 100)),
      isGoalReached: day.totalAmount >= day.dailyGoal
    })).sort((a, b) => b.date.localeCompare(a.date));

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          dailyGoal: targetUser.dailyGoal || DEFAULT_DAILY_GOAL
        },
        dailyTotals,
        totalLogged: logs.reduce((sum, item) => sum + item.amount, 0),
        totalEntries: logs.length,
        logs
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logIntake,
  getTodayIntake,
  getIntakeHistory,
  deleteIntake,
  getUserIntakeHistoryAdmin
};
