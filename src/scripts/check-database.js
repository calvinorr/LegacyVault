const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/household-finance-vault';

async function checkDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Check transactions
    const transactionCount = await db.collection('transactions').countDocuments();
    console.log(`📊 Transactions: ${transactionCount} total`);

    if (transactionCount > 0) {
      const transactions = await db.collection('transactions').find({}).limit(5).toArray();
      console.log('\nSample transactions:');
      transactions.forEach((t, idx) => {
        console.log(`  ${idx + 1}. ${t.description} | Status: ${t.status || 'undefined'} | RecordCreated: ${t.recordCreated || false}`);
      });
    }

    // Check import sessions
    const sessionCount = await db.collection('importsessions').countDocuments();
    console.log(`\n📊 Import Sessions: ${sessionCount} total`);

    // Check old domain records
    console.log('\n📊 Old Domain Records:');
    const oldCollections = [
      'vehiclerecords',
      'propertyrecords',
      'financerecords',
      'servicesrecords'
    ];

    for (const collectionName of oldCollections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        if (count > 0) {
          console.log(`  - ${collectionName}: ${count} records`);
        }
      } catch (err) {
        // Collection doesn't exist
      }
    }

    // Check Epic 6 records
    console.log('\n📊 Epic 6 Records:');
    const parentCount = await db.collection('parententities').countDocuments();
    const childCount = await db.collection('childrecords').countDocuments();
    console.log(`  - ParentEntities: ${parentCount}`);
    console.log(`  - ChildRecords: ${childCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkDatabase();
