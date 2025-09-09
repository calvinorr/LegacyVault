module.exports = async () => {
  console.log('Tearing down MongoDB Memory Server...');
  
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
    console.log('MongoDB Memory Server stopped');
  }
};