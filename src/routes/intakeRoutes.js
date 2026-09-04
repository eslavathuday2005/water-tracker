const express = require('express');
const { body } = require('express-validator');
const {
  logIntake,
  getTodayIntake,
  getIntakeHistory,
  deleteIntake,
  getUserIntakeHistoryAdmin
} = require('../controllers/intakeController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

// All intake routes require authentication
router.use(protect);

router.post(
  '/',
  [
    body('amount')
      .notEmpty()
      .withMessage('Intake amount is required')
      .isFloat({ min: 1 })
      .withMessage('Intake amount must be a positive number greater than 0'),
    body('unit')
      .optional()
      .isIn(['ml', 'glasses', 'oz'])
      .withMessage('Unit must be ml, glasses, or oz'),
    body('date')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format'),
    validate
  ],
  logIntake
);

router.get('/today', getTodayIntake);
router.get('/history', getIntakeHistory);
router.delete('/:id', deleteIntake);

// Admin-only route: view any user's intake history
router.get('/user/:userId', requireAdmin, getUserIntakeHistoryAdmin);

module.exports = router;
