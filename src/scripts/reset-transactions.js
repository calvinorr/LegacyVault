// Script to reset all transactions and clean old domain records
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/household-finance-vault';

async function resetTransactions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // 1. Reset all transaction statuses
    const transactionsResult = await db.collection('transactions').updateMany(
      {},
      {
        $set: {
          status: 'pending',
          recordCreated: false
        },
        $unset: {
          createdRecordId: '',
          createdRecordDomain: '',
          parentId: '',
          ignoredReason: ''
        }
      }
    );
    console.log(`✅ Reset ${transactionsResult.modifiedCount} transactions to 'pending' status`);

    // 2. Delete old domain records (legacy system)
    const collections = [
      'vehiclerecords',
      'propertyrecords',
      'financerecords',
      'employmentrecords',
      'governmentrecords',
      'insurancerecords',
      'legalrecords',
      'servicesrecords'
    ];

    let totalDeleted = 0;
    for (const collectionName of collections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        if (count > 0) {
          const result = await db.collection(collectionName).deleteMany({});
          console.log(`✅ Deleted ${result.deletedCount} records from ${collectionName}`);
          totalDeleted += result.deletedCount;
        }
      } catch (err) {
        // Collection might not exist, that's OK
        console.log(`⚠️  Collection ${collectionName} doesn't exist (OK)`);
      }
    }

    console.log(`\n🎉 Reset complete!`);
    console.log(`   - ${transactionsResult.modifiedCount} transactions reset to pending`);
    console.log(`   - ${totalDeleted} old domain records deleted`);
    console.log(`\n✅ All transactions are now ready for the new Epic 6 workflow!`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

resetTransactions();
