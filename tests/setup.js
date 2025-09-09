const mongoose = require('mongoose');

beforeAll(async () => {
  // Connect to MongoDB Memory Server started in globalSetup.js
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL environment variable is not set. Check globalSetup.js');
  }
  
  await mongoose.connect(process.env.MONGO_URL);
});

beforeEach(async () => {
  // Clean up database between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});