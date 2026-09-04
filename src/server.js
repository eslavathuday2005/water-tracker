const app = require('./app');
const { connectDB } = require('./config/db');
const { PORT } = require('./config/env');
const { seedDatabase } = require('./utils/seed');

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Seed initial data (Admin, Demo User, Defaults)
    await seedDatabase();

    // 3. Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Water Intake Tracker API Server running on port ${PORT}`);
      console.log(`📡 Health check available at: http://localhost:${PORT}/api/health`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`💥 Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
