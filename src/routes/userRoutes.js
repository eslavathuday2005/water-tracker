const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  updateUserGoal,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

// Apply auth and admin protection to all user management routes
router.use(protect);
router.use(requireAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);

router.patch(
  '/:id/goal',
  [
    body('dailyGoal')
      .notEmpty()
      .withMessage('Daily goal is required')
      .isFloat({ min: 1 })
      .withMessage('Daily goal must be a positive number greater than 0'),
    validate
  ],
  updateUserGoal
);

router.delete('/:id', deleteUser);

module.exports = router;
