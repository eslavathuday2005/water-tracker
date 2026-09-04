const express = require('express');
const { body } = require('express-validator');
const {
  getAdminOverview,
  updateSystemGoal,
  getSystemGoal
} = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.get('/system-goal', getSystemGoal);

router.get('/overview', protect, requireAdmin, getAdminOverview);

router.put(
  '/system-goal',
  protect,
  requireAdmin,
  [
    body('defaultDailyGoal')
      .notEmpty()
      .withMessage('Default daily goal is required')
      .isFloat({ min: 1 })
      .withMessage('Default daily goal must be a positive number greater than 0'),
    validate
  ],
  updateSystemGoal
);

module.exports = router;
