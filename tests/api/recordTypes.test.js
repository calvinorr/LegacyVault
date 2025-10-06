const request = require('supertest');
const express = require('express');
const cookieSession = require('cookie-session');
const passport = require('passport');
const mongoose = require('mongoose');
const recordTypesRouter = require('../../src/routes/recordTypes');
const RecordType = require('../../src/models/RecordType');

// Mock auth middleware
const mockUserId = new mongoose.Types.ObjectId();

jest.mock('../../src/middleware/auth', () => {
  return {
    ensureAuthenticated: (req, res, next) => {
      req.user = {
        id: mockUserId,
        isAdmin: req.headers['x-is-admin'] === 'true'
      };
      next();
    },
    ensureAdmin: (req, res, next) => {
      if (req.user && req.user.isAdmin) {
        return next();
      }
      res.status(403).json({ error: 'Forbidden' });
    }
  };
});

const app = express();
app.use(express.json());
app.use(cookieSession({ name: 'session', keys: ['key1'] }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/record-types', recordTypesRouter);

describe('Record Types API', () => {
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    userId = new mongoose.Types.ObjectId();
  });

  afterEach(async () => {
    await RecordType.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/record-types', () => {
    it('should create a record type for an admin', async () => {
      const res = await request(app)
        .post('/api/record-types')
        .set('x-is-admin', 'true')
        .send({ name: 'Utility', domain: 'property' });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('name', 'Utility');
    });

    it('should not create a record type for a non-admin', async () => {
      const res = await request(app)
        .post('/api/record-types')
        .set('x-is-admin', 'false')
        .send({ name: 'Utility', domain: 'property' });
      expect(res.statusCode).toEqual(403);
    });

    it('should not create a duplicate record type', async () => {
        await request(app)
            .post('/api/record-types')
            .set('x-is-admin', 'true')
            .send({ name: 'Utility', domain: 'property' });
        const res = await request(app)
            .post('/api/record-types')
            .set('x-is-admin', 'true')
            .send({ name: 'Utility', domain: 'property' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toContain('Duplicate');
    });
  });

  describe('GET /api/record-types', () => {
    it('should get all record types for a user', async () => {
        await request(app).post('/api/record-types').set('x-is-admin', 'true').send({ name: 'Gas', domain: 'property' });
        await request(app).post('/api/record-types').set('x-is-admin', 'true').send({ name: 'Car Insurance', domain: 'vehicles' });
        const res = await request(app).get('/api/record-types').set('x-is-admin', 'false');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
    });

    it('should filter record types by domain', async () => {
        await request(app).post('/api/record-types').set('x-is-admin', 'true').send({ name: 'Gas', domain: 'property' });
        await request(app).post('/api/record-types').set('x-is-admin', 'true').send({ name: 'Car Insurance', domain: 'vehicles' });
        const res = await request(app).get('/api/record-types?domain=property').set('x-is-admin', 'false');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Gas');
    });
  });

   describe('PUT /api/record-types/:id', () => {
    it('should update a record type for an admin', async () => {
      const recordType = await request(app).post('/api/record-types').set('x-is-admin', 'true').send({ name: 'Gas', domain: 'property' });
      const res = await request(app)
        .put(`/api/record-types/${recordType.body._id}`)
        .set('x-is-admin', 'true')
        .send({ name: 'Electricity' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Electricity');
    });
  });

  describe('DELETE /api/record-types/:id', () => {
    it('should delete a record type for an admin', async () => {
      const recordType = await request(app).post('/api/record-types').set('x-is-admin', 'true').send({ name: 'Gas', domain: 'property' });
      const res = await request(app)
        .delete(`/api/record-types/${recordType.body._id}`)
        .set('x-is-admin', 'true');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });
});
