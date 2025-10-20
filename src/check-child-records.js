const mongoose = require('mongoose');
const ChildRecord = require('./models/childRecord');
const ParentEntity = require('./models/parentEntity');
require('dotenv').config();

async function checkChildRecords() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected\n');

  const vehicles = await ParentEntity.find({ domainType: 'Vehicle' });
  console.log(`Found ${vehicles.length} vehicles\n`);

  for (const vehicle of vehicles) {
    const childRecords = await ChildRecord.find({ parentEntityId: vehicle._id });
    console.log(`Vehicle: ${vehicle.name}`);
    console.log(`  - Parent ID: ${vehicle._id}`);
    console.log(`  - Child Records: ${childRecords.length}`);
    if (childRecords.length > 0) {
      childRecords.forEach(r => {
        console.log(`    • ${r.recordType}: ${r.name || r.fields.name || '(no name)'}`);
      });
    }
    console.log('');
  }

  await mongoose.disconnect();
}

checkChildRecords().catch(console.error);
