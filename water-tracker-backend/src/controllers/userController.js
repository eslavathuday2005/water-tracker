const User = require('../models/User');
const IntakeLog = require('../models/IntakeLog');
const { DEFAULT_DAILY_GOAL } = require('../config/env');

// @desc    Admin: Get list of all registered users with intake summary
// @route   GET /api/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    // Enhance users with total intake and logs count
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        const logs = await IntakeLog.find({ user: user._id });
        const totalIntake = logs.reduce((sum, item) => sum + item.amount, 0);

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          dailyGoal: user.dailyGoal || DEFAULT_DAILY_GOAL,
          totalIntakeLogged: totalIntake,
          totalLogsCount: logs.length,
          createdAt: user.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedUsers.length,
      data: enhancedUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get user details by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const logs = await IntakeLog.find({ user: user._id });
    const totalIntake = logs.reduce((sum, item) => sum + item.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dailyGoal: user.dailyGoal || DEFAULT_DAILY_GOAL,
        totalIntakeLogged: totalIntake,
        totalLogsCount: logs.length,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Set or update the recommended daily water intake goal for a user
// @route   PATCH /api/users/:id/goal
// @access  Private (Admin only)
const updateUserGoal = async (req, res, next) => {
  try {
    const { dailyGoal } = req.body;
    const goalNumber = Number(dailyGoal);

    // Edge Case: Validate goal is positive number
    if (isNaN(goalNumber) || goalNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Recommended daily goal must be a positive number greater than 0'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.dailyGoal = goalNumber;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Daily goal updated to ${goalNumber}ml successfully for ${user.name}`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyGoal: user.dailyGoal
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete a user account and their logs
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    // Edge Case: Admin tries to delete their own account - must be rejected!
    if (req.user._id.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Forbidden: Admin cannot delete their own account'
      });
    }

    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete all intake logs associated with this user
    await IntakeLog.deleteMany({ user: targetUserId });

    // Delete user
    await User.findByIdAndDelete(targetUserId);

    res.status(200).json({
      success: true,
      message: `User ${user.email} and all associated logs were deleted successfully`,
      data: { id: targetUserId }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserGoal,
  deleteUser
};
