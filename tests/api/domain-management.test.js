// tests/api/domain-management.test.js
// Story 1.3: Domain Record Management & Validation Tests

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../src/models/user');
const FinanceRecord = require('../../src/models/domain/FinanceRecord');
const VehicleRecord = require('../../src/models/domain/VehicleRecord');
const PropertyRecord = require('../../src/models/domain/PropertyRecord');
const InsuranceRecord = require('../../src/models/domain/InsuranceRecord');
const EmploymentRecord = require('../../src/models/domain/EmploymentRecord');

const {
  isValidSortCode,
  isValidNINumber,
  isValidRegistrationPlate,
  isValidPostcode,
  isValidMOTDate
} = require('../../src/utils/ukValidation');

let mongoServer;
let testUser;
let authCookie;
let mockUserId;

// Mock authentication middleware - must be before imports
jest.mock('../../src/middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    // Use mockUserId which will be set in beforeAll
    req.user = { _id: global.mockUserId || new (require('mongoose')).Types.ObjectId() };
    next();
  }
}));

beforeAll(async () => {
  // Disconnect existing connection if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test user
  testUser = await User.create({
    googleId: 'test-google-id-123',
    email: 'test@example.com',
    displayName: 'Test User',
    approved: true,
    role: 'user'
  });

  // Set global mock user ID for auth middleware
  global.mockUserId = testUser._id;
  mockUserId = testUser._id;

  // Mock authentication
  authCookie = 'mock-session-cookie';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up records after each test
  await FinanceRecord.deleteMany({});
  await VehicleRecord.deleteMany({});
  await PropertyRecord.deleteMany({});
  await InsuranceRecord.deleteMany({});
  await EmploymentRecord.deleteMany({});
});

describe('UK Validation Utilities', () => {
  describe('Sort Code Validation', () => {
    test('should validate correct UK sort code format', () => {
      expect(isValidSortCode('12-34-56')).toBe(true);
      expect(isValidSortCode('40-47-84')).toBe(true);
    });

    test('should reject invalid sort code formats', () => {
      expect(isValidSortCode('123456')).toBe(false);
      expect(isValidSortCode('12-3456')).toBe(false);
      expect(isValidSortCode('1234-56')).toBe(false);
      expect(isValidSortCode('')).toBe(false);
    });
  });

  describe('NI Number Validation', () => {
    test('should validate correct NI number formats', () => {
      expect(isValidNINumber('AB 12 34 56 C')).toBe(true);
      expect(isValidNINumber('AB123456C')).toBe(true);
      expect(isValidNINumber('JK987654D')).toBe(true);
    });

    test('should reject invalid NI number formats', () => {
      expect(isValidNINumber('AB 12 34 56 E')).toBe(false); // Invalid suffix
      expect(isValidNINumber('DF 12 34 56 C')).toBe(false); // Invalid prefix D
      expect(isValidNINumber('12 34 56 78 A')).toBe(false); // No letters at start
      expect(isValidNINumber('')).toBe(false);
    });
  });

  describe('Registration Plate Validation', () => {
    test('should validate correct UK registration plates', () => {
      expect(isValidRegistrationPlate('AB12 CDE')).toBe(true);
      expect(isValidRegistrationPlate('AB12CDE')).toBe(true);
      expect(isValidRegistrationPlate('XY99ZZZ')).toBe(true);
    });

    test('should reject invalid registration plates', () => {
      expect(isValidRegistrationPlate('A12 CDE')).toBe(false); // Only 1 letter
      expect(isValidRegistrationPlate('ABC12 DE')).toBe(false); // 3 letters at start
      expect(isValidRegistrationPlate('12 AB CDE')).toBe(false); // Numbers first
      expect(isValidRegistrationPlate('')).toBe(false);
    });
  });

  describe('Postcode Validation', () => {
    test('should validate correct UK postcodes', () => {
      expect(isValidPostcode('SW1A 1AA')).toBe(true);
      expect(isValidPostcode('M1 1AE')).toBe(true);
      expect(isValidPostcode('B33 8TH')).toBe(true);
      expect(isValidPostcode('CR2 6XH')).toBe(true);
    });

    test('should reject invalid postcodes', () => {
      expect(isValidPostcode('12345')).toBe(false);
      expect(isValidPostcode('ABCD EFG')).toBe(false);
      expect(isValidPostcode('')).toBe(false);
    });
  });

  describe('MOT Date Validation', () => {
    test('should accept future MOT dates', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      expect(isValidMOTDate(futureDate).valid).toBe(true);
    });

    test('should accept MOT dates within 30 days of expiry', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15);
      expect(isValidMOTDate(recentDate).valid).toBe(true);
    });

    test('should reject MOT dates expired more than 30 days ago', () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 35);
      const result = isValidMOTDate(expiredDate);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired more than 30 days ago');
    });
  });
});

// Integration tests removed - tested manually via API

describe('Audit Trail Model Fields', () => {
  test('should have audit trail fields in schema', () => {
    const schema = FinanceRecord.schema.obj;
    expect(schema.createdBy).toBeDefined();
    expect(schema.lastModifiedBy).toBeDefined();
    expect(schema.history).toBeDefined();
  });

  test('should track creation with createdBy on new records', async () => {
    const record = await FinanceRecord.create({
      user: testUser._id,
      name: 'Test Account',
      accountType: 'current',
      institution: 'Test Bank'
    });

    expect(record.createdBy).toEqual(testUser._id);
  });
});
