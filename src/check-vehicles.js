const mongoose = require('mongoose');
const ParentEntity = require('./models/parentEntity');
require('dotenv').config();

async function checkVehicles() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  
  const vehicles = await ParentEntity.find({ domainType: 'Vehicle' }).limit(5);
  console.log('Found vehicles:', vehicles.length);
  
  if (vehicles.length > 0) {
    console.log('\nSample vehicle:');
    console.log('- ID:', vehicles[0]._id);
    console.log('- Name:', vehicles[0].name);
    console.log('- Domain:', vehicles[0].domainType);
    console.log('- Fields:', JSON.stringify(vehicles[0].fields, null, 2));
  }
  
  await mongoose.disconnect();
}

checkVehicles().catch(console.error);
