const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_water_tracker_key_12345',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  DEFAULT_DAILY_GOAL: parseInt(process.env.DEFAULT_DAILY_GOAL, 10) || 2000,
  ADMIN_NAME: process.env.ADMIN_NAME || 'Admin User',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@watertracker.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@12345'
};
