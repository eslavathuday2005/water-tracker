const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const IntakeLog = require('../src/models/IntakeLog');
const SystemConfig = require('../src/models/SystemConfig');

let mongoServer;
let adminToken;
let adminUser;
let userToken;
let normalUser;
let otherUserToken;
let otherUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Initialize system config
  await SystemConfig.create({
    key: 'system_settings',
    defaultDailyGoal: 2000
  });

  // Create admin user
  adminUser = await User.create({
    name: 'Test Admin',
    email: 'testadmin@watertracker.com',
    password: 'Admin@12345',
    role: 'admin',
    dailyGoal: 2500
  });
  adminToken = adminUser.getSignedJwtToken();

  // Create normal user
  normalUser = await User.create({
    name: 'Normal User',
    email: 'normal@watertracker.com',
    password: 'User@12345',
    role: 'user',
    dailyGoal: 2000
  });
  userToken = normalUser.getSignedJwtToken();

  // Create second user for authorization test
  otherUser = await User.create({
    name: 'Other User',
    email: 'other@watertracker.com',
    password: 'User@12345',
    role: 'user',
    dailyGoal: 2000
  });
  otherUserToken = otherUser.getSignedJwtToken();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('1. Health Check API', () => {
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
  });
});

describe('2. Authentication & JWT', () => {
  it('POST /api/auth/register should register a new user with JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sarah Connor',
        email: 'sarah@test.com',
        password: 'Password@123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('sarah@test.com');
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.user.dailyGoal).toBe(2000); // Default goal
  });

  it('POST /api/auth/register should reject duplicate email with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Sarah',
        email: 'sarah@test.com',
        password: 'Password@123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login should authenticate valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sarah@test.com',
        password: 'Password@123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/auth/login should reject invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sarah@test.com',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should return user profile with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('normal@watertracker.com');
  });

  it('GET /api/auth/me should reject request without token with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('3. Water Intake Logging & Edge Cases', () => {
  let createdLogId;

  it('POST /api/intake should successfully log water intake', async () => {
    const res = await request(app)
      .post('/api/intake')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 250,
        unit: 'ml',
        note: 'Morning glass'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.entry.amount).toBe(250);
    expect(res.body.data.todaySummary.totalAmount).toBe(250);
    createdLogId = res.body.data.entry._id;
  });

  it('EDGE CASE: POST /api/intake with 0 or negative amount must be rejected (400)', async () => {
    const resZero = await request(app)
      .post('/api/intake')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 0 });

    expect(resZero.status).toBe(400);

    const resNeg = await request(app)
      .post('/api/intake')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: -500 });

    expect(resNeg.status).toBe(400);
  });

  it('GET /api/intake/today should return today total vs daily goal', async () => {
    const res = await request(app)
      .get('/api/intake/today')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalAmount).toBe(250);
    expect(res.body.data.dailyGoal).toBe(2000);
    expect(res.body.data.remainingAmount).toBe(1750);
    expect(res.body.data.percentage).toBe(13); // 250 / 2000 = 12.5% -> 13%
  });

  it('GET /api/intake/history should return aggregated daily totals and logs', async () => {
    const res = await request(app)
      .get('/api/intake/history')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.dailyTotals)).toBe(true);
    expect(res.body.data.dailyTotals.length).toBeGreaterThan(0);
  });

  it('EDGE CASE: User trying to delete an entry belonging to another user must return 403', async () => {
    const res = await request(app)
      .delete(`/api/intake/${createdLogId}`)
      .set('Authorization', `Bearer ${otherUserToken}`); // other user

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/intake/:id should allow user to delete their own entry', async () => {
    const res = await request(app)
      .delete(`/api/intake/${createdLogId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('4. RBAC & Admin Capabilities', () => {
  it('EDGE CASE: Normal user accessing admin route GET /api/users must return 403', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Admin/i);
  });

  it('GET /api/users should allow Admin to view list of registered users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it('GET /api/intake/user/:userId should allow Admin to view any user intake history', async () => {
    const res = await request(app)
      .get(`/api/intake/user/${normalUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('normal@watertracker.com');
  });

  it('PATCH /api/users/:id/goal should allow Admin to update a user daily goal', async () => {
    const res = await request(app)
      .patch(`/api/users/${normalUser._id}/goal`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ dailyGoal: 3000 });

    expect(res.status).toBe(200);
    expect(res.body.data.dailyGoal).toBe(3000);
  });

  it('EDGE CASE: Admin trying to delete their own account must be rejected (400)', async () => {
    const res = await request(app)
      .delete(`/api/users/${adminUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/cannot delete their own account/i);
  });

  it('DELETE /api/users/:id should allow Admin to delete another user', async () => {
    const res = await request(app)
      .delete(`/api/users/${otherUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify user is gone
    const check = await User.findById(otherUser._id);
    expect(check).toBeNull();
  });

  it('GET /api/stats/overview should return platform usage statistics for Admin', async () => {
    const res = await request(app)
      .get('/api/stats/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalUsers).toBeDefined();
    expect(res.body.data.totalAdmins).toBeDefined();
    expect(res.body.data.defaultDailyGoal).toBeDefined();
  });
});
