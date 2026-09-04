const mongoose = require('mongoose');

const intakeLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Intake amount is required'],
      min: [1, 'Intake amount must be greater than 0']
    },
    unit: {
      type: String,
      default: 'ml',
      enum: ['ml', 'glasses', 'oz']
    },
    date: {
      type: String,
      required: [true, 'Date string is required (YYYY-MM-DD)'],
      index: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: [100, 'Note cannot exceed 100 characters']
    },
    loggedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient user-by-date queries
intakeLogSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('IntakeLog', intakeLogSchema);
