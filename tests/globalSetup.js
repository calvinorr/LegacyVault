const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  console.log('Setting up MongoDB Memory Server...');
  
  const mongod = await MongoMemoryServer.create({
    binary: {
      version: '6.0.4',
    },
    instance: {
      dbName: 'test-household-finance',
    },
  });

  const uri = mongod.getUri();
  process.env.MONGO_URL = uri;
  
  // Store the instance in global so we can stop it later
  global.__MONGOD__ = mongod;
  
  console.log('MongoDB Memory Server started at:', uri);
};