// tests/api/renewals.test.js
// API tests for renewal endpoints

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const session = require('cookie-session');
const passport = require('passport');

const renewalsRouter = require('../../src/routes/renewals');
const PropertyRecord = require('../../src/models/domain/PropertyRecord');
const VehicleRecord = require('../../src/models/domain/VehicleRecord');
const FinanceRecord = require('../../src/models/domain/FinanceRecord');
const User = require('../../src/models/user');

let mongoServer;
let app;
let testUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Create test user
  testUser = await User.create({
    googleId: 'test-google-id',
    email: 'test@example.com',
    displayName: 'Test User',
    approved: true,
    role: 'user'
  });

  // Setup Express app with authentication mock
  app = express();
  app.use(express.json());
  app.use(session({ keys: ['test-secret'] }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Mock authentication middleware
  app.use((req, res, next) => {
    req.user = testUser;
    req.isAuthenticated = () => true;
    next();
  });

  app.use('/api/renewals', renewalsRouter);
});

afterEach(async () => {
  await User.deleteMany({});
  await PropertyRecord.deleteMany({});
  await VehicleRecord.deleteMany({});
  await FinanceRecord.deleteMany({});
});

describe('GET /api/renewals/summary', () => {
  it('returns zero counts when no records exist', async () => {
    const response = await request(app)
      .get('/api/renewals/summary')
      .expect(200);

    expect(response.body).toEqual({
      overdue: 0,
      next7Days: 0,
      next30Days: 0,
      total: 0
    });
  });

  it('counts overdue renewals correctly', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await PropertyRecord.create({
      user: testUser._id,
      name: 'Overdue Insurance',
      recordType: 'home-insurance',
      renewalDate: yesterday
    });

    const response = await request(app)
      .get('/api/renewals/summary')
      .expect(200);

    expect(response.body.overdue).toBe(1);
    expect(response.body.total).toBe(1);
  });

  it('counts next 7 days renewals correctly', async () => {
    const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    await VehicleRecord.create({
      user: testUser._id,
      name: 'Car MOT',
      recordType: 'mot',
      renewalDate: in3Days
    });

    const response = await request(app)
      .get('/api/renewals/summary')
      .expect(200);

    expect(response.body.next7Days).toBe(1);
    expect(response.body.total).toBe(1);
  });

  it('counts next 30 days renewals correctly', async () => {
    const in15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    await FinanceRecord.create({
      user: testUser._id,
      name: 'ISA Maturity',
      recordType: 'isa',
      renewalDate: in15Days
    });

    const response = await request(app)
      .get('/api/renewals/summary')
      .expect(200);

    expect(response.body.next30Days).toBe(1);
    expect(response.body.total).toBe(1);
  });

  it('aggregates renewals from multiple domains', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const in15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    await PropertyRecord.create({
      user: testUser._id,
      name: 'Home Insurance',
      recordType: 'home-insurance',
      renewalDate: yesterday
    });

    await VehicleRecord.create({
      user: testUser._id,
      name: 'Car MOT',
      recordType: 'mot',
      renewalDate: in3Days
    });

    await FinanceRecord.create({
      user: testUser._id,
      name: 'ISA',
      recordType: 'isa',
      renewalDate: in15Days
    });

    const response = await request(app)
      .get('/api/renewals/summary')
      .expect(200);

    expect(response.body.overdue).toBe(1);
    expect(response.body.next7Days).toBe(1);
    expect(response.body.next30Days).toBe(1);
    expect(response.body.total).toBe(3);
  });

  it('excludes records without renewal dates', async () => {
    await PropertyRecord.create({
      user: testUser._id,
      name: 'No Renewal Date',
      recordType: 'home-insurance'
      // No renewalDate field
    });

    const response = await request(app)
      .get('/api/renewals/summary')
      .expect(200);

    expect(response.body.total).toBe(0);
  });
});

describe('GET /api/renewals/timeline', () => {
  it('returns empty array when no renewals exist', async () => {
    const response = await request(app)
      .get('/api/renewals/timeline')
      .expect(200);

    expect(response.body.renewals).toEqual([]);
  });

  it('returns renewals from all domains', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await PropertyRecord.create({
      user: testUser._id,
      name: 'Property Renewal',
      recordType: 'home-insurance',
      renewalDate: tomorrow,
      priority: 'Critical'
    });

    await VehicleRecord.create({
      user: testUser._id,
      name: 'Vehicle Renewal',
      recordType: 'mot',
      renewalDate: tomorrow,
      priority: 'Important'
    });

    const response = await request(app)
      .get('/api/renewals/timeline')
      .expect(200);

    expect(response.body.renewals).toHaveLength(2);
    expect(response.body.renewals[0].domain).toBeDefined();
    expect(response.body.renewals[0].name).toBeDefined();
    expect(response.body.renewals[0].renewalDate).toBeDefined();
  });

  it('filters by domain', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await PropertyRecord.create({
      user: testUser._id,
      name: 'Property Renewal',
      recordType: 'home-insurance',
      renewalDate: tomorrow
    });

    await VehicleRecord.create({
      user: testUser._id,
      name: 'Vehicle Renewal',
      recordType: 'mot',
      renewalDate: tomorrow
    });

    const response = await request(app)
      .get('/api/renewals/timeline?domain=property')
      .expect(200);

    expect(response.body.renewals).toHaveLength(1);
    expect(response.body.renewals[0].domain).toBe('property');
  });

  it('filters by priority', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await PropertyRecord.create({
      user: testUser._id,
      name: 'Critical Renewal',
      recordType: 'home-insurance',
      renewalDate: tomorrow,
      priority: 'Critical'
    });

    await VehicleRecord.create({
      user: testUser._id,
      name: 'Standard Renewal',
      recordType: 'mot',
      renewalDate: tomorrow,
      priority: 'Standard'
    });

    const response = await request(app)
      .get('/api/renewals/timeline?priority=Critical')
      .expect(200);

    expect(response.body.renewals).toHaveLength(1);
    expect(response.body.renewals[0].priority).toBe('Critical');
  });

  it('sorts renewals by date ascending', async () => {
    const today = new Date();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await PropertyRecord.create({
      user: testUser._id,
      name: 'Next Week',
      recordType: 'home-insurance',
      renewalDate: nextWeek
    });

    await VehicleRecord.create({
      user: testUser._id,
      name: 'Tomorrow',
      recordType: 'mot',
      renewalDate: tomorrow
    });

    await FinanceRecord.create({
      user: testUser._id,
      name: 'Today',
      recordType: 'isa',
      renewalDate: today
    });

    const response = await request(app)
      .get('/api/renewals/timeline')
      .expect(200);

    expect(response.body.renewals).toHaveLength(3);
    expect(response.body.renewals[0].name).toBe('Today');
    expect(response.body.renewals[1].name).toBe('Tomorrow');
    expect(response.body.renewals[2].name).toBe('Next Week');
  });
});
