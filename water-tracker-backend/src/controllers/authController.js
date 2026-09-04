const User = require('../models/User');
const SystemConfig = require('../models/SystemConfig');
const { DEFAULT_DAILY_GOAL } = require('../config/env');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Get current system default daily goal if available, or fall back to env/2000
    let initialDailyGoal = DEFAULT_DAILY_GOAL;
    try {
      const config = await SystemConfig.findOne({ key: 'system_settings' });
      if (config && config.defaultDailyGoal) {
        initialDailyGoal = config.defaultDailyGoal;
      }
    } catch (err) {
      // Graceful fallback to 2000
      initialDailyGoal = 2000;
    }

    // Create user (always role 'user' from public endpoint for security)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user',
      dailyGoal: initialDailyGoal
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          dailyGoal: user.dailyGoal,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user (must select password since it has select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          dailyGoal: user.dailyGoal,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dailyGoal: user.dailyGoal || DEFAULT_DAILY_GOAL,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile (name or personal daily goal)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, dailyGoal } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (dailyGoal) {
      const goalNum = Number(dailyGoal);
      if (isNaN(goalNum) || goalNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Daily goal must be a positive number'
        });
      }
      updates.dailyGoal = goalNum;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        dailyGoal: updatedUser.dailyGoal,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
