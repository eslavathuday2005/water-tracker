const User = require('../models/User');
const IntakeLog = require('../models/IntakeLog');
const SystemConfig = require('../models/SystemConfig');
const {
  ADMIN_NAME,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  DEFAULT_DAILY_GOAL
} = require('../config/env');

const getFormattedDate = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const seedDatabase = async () => {
  try {
    // 1. Ensure SystemConfig exists
    let config = await SystemConfig.findOne({ key: 'system_settings' });
    if (!config) {
      config = await SystemConfig.create({
        key: 'system_settings',
        defaultDailyGoal: DEFAULT_DAILY_GOAL
      });
      console.log('🌱 System settings initialized with default goal:', DEFAULT_DAILY_GOAL, 'ml');
    }

    // 2. Check and Seed Admin
    let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (!admin) {
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        password: ADMIN_PASSWORD,
        role: 'admin',
        dailyGoal: 2500
      });
      console.log(`🌱 Admin account created: ${ADMIN_EMAIL} (Password: ${ADMIN_PASSWORD})`);
    }

    // 3. Check and Seed Demo User
    const demoEmail = 'user@watertracker.com';
    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Johnson',
        email: demoEmail,
        password: 'User@12345',
        role: 'user',
        dailyGoal: 2000
      });
      console.log(`🌱 Demo user account created: ${demoEmail} (Password: User@12345)`);

      // Seed sample intake history for the demo user
      const sampleLogs = [
        // Today
        { user: demoUser._id, amount: 250, unit: 'ml', date: getFormattedDate(0), note: 'Morning glass' },
        { user: demoUser._id, amount: 500, unit: 'ml', date: getFormattedDate(0), note: 'Post-run hydration' },
        { user: demoUser._id, amount: 250, unit: 'ml', date: getFormattedDate(0), note: 'Lunch water' },
        // Yesterday
        { user: demoUser._id, amount: 500, unit: 'ml', date: getFormattedDate(1), note: 'Morning bottle' },
        { user: demoUser._id, amount: 500, unit: 'ml', date: getFormattedDate(1), note: 'Afternoon hydration' },
        { user: demoUser._id, amount: 750, unit: 'ml', date: getFormattedDate(1), note: 'Evening tumbler' },
        { user: demoUser._id, amount: 250, unit: 'ml', date: getFormattedDate(1), note: 'Before bed' },
        // 2 days ago
        { user: demoUser._id, amount: 500, unit: 'ml', date: getFormattedDate(2), note: 'Breakfast drink' },
        { user: demoUser._id, amount: 500, unit: 'ml', date: getFormattedDate(2), note: 'Workout session' },
        { user: demoUser._id, amount: 500, unit: 'ml', date: getFormattedDate(2), note: 'Dinner water' },
        // 3 days ago
        { user: demoUser._id, amount: 750, unit: 'ml', date: getFormattedDate(3), note: 'Full water bottle' },
        { user: demoUser._id, amount: 500, unit: 'ml', date: getFormattedDate(3), note: 'Afternoon top-up' },
        { user: demoUser._id, amount: 500, unit: 'ml', date: getFormattedDate(3), note: 'Evening hydration' },
        { user: demoUser._id, amount: 250, unit: 'ml', date: getFormattedDate(3), note: 'Late night glass' }
      ];

      await IntakeLog.insertMany(sampleLogs);
      console.log('🌱 Sample water intake history seeded for demo user.');
    }
  } catch (err) {
    console.error('Error seeding initial data:', err.message);
  }
};

module.exports = { seedDatabase };

// Allow direct standalone execution via `npm run seed` or `node src/utils/seed.js`
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');

  (async () => {
    try {
      console.log('🚀 Running standalone database seeder...');
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      console.log('✅ Database seeding finished successfully.');
      process.exit(0);
    } catch (error) {
      console.error('❌ Database seeding failed:', error.message);
      process.exit(1);
    }
  })();
}
