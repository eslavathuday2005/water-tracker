const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'system_settings'
    },
    defaultDailyGoal: {
      type: Number,
      default: 2000,
      min: [250, 'Default goal must be at least 250ml'],
      max: [10000, 'Default goal cannot exceed 10000ml']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
