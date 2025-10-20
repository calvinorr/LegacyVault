const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/household-finance-vault';

async function checkParentEntities() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Check ParentEntities collection
    const parentCount = await db.collection('parententities').countDocuments();
    console.log(`📊 ParentEntities: ${parentCount} total\n`);

    if (parentCount > 0) {
      const parents = await db.collection('parententities').find({}).toArray();
      console.log('All Parent Entities:');
      parents.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.name} (${p.domainType})`);
        console.log(`     ID: ${p._id}`);
        console.log(`     User: ${p.userId}`);
        console.log(`     Status: ${p.status || 'undefined'}`);
        console.log(`     Created: ${p.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No parent entities found in database!');
    }

    // Check ChildRecords
    const childCount = await db.collection('childrecords').countDocuments();
    console.log(`\n📊 ChildRecords: ${childCount} total`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkParentEntities();
