const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/household-finance-vault';

async function resetAllTransactions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // 1. First check what we have
    const transactionCount = await db.collection('transactions').countDocuments();
    console.log(`\n📊 Found ${transactionCount} transactions in database`);

    if (transactionCount > 0) {
      const withStatus = await db.collection('transactions').find({
        $or: [
          { status: { $exists: true } },
          { recordCreated: true },
          { createdRecordId: { $exists: true } }
        ]
      }).toArray();

      console.log(`   - ${withStatus.length} have status/record metadata`);

      // Show what we're resetting
      withStatus.forEach(t => {
        console.log(`     • ${t.description} | Status: ${t.status || 'none'} | RecordId: ${t.createdRecordId || 'none'}`);
      });
    }

    // 2. Reset ALL transactions - set status to 'pending' and clear metadata
    const result = await db.collection('transactions').updateMany(
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
          ignoredReason: '',
          ignoredAt: ''
        }
      }
    );

    console.log(`\n✅ Reset ${result.modifiedCount} transactions (set status='pending', cleared record links)`);

    // 3. Delete all old domain records (legacy system)
    const oldCollections = [
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
    for (const collectionName of oldCollections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        if (count > 0) {
          const deleteResult = await db.collection(collectionName).deleteMany({});
          console.log(`✅ Deleted ${deleteResult.deletedCount} old records from ${collectionName}`);
          totalDeleted += deleteResult.deletedCount;
        }
      } catch (err) {
        // Collection doesn't exist - OK
      }
    }

    if (totalDeleted > 0) {
      console.log(`\n🗑️  Total old domain records deleted: ${totalDeleted}`);
    }

    // 4. Verify the reset
    console.log('\n🔍 Verification:');
    const pendingCount = await db.collection('transactions').countDocuments({ status: 'pending' });
    const hasRecordId = await db.collection('transactions').countDocuments({ createdRecordId: { $exists: true } });
    const total = await db.collection('transactions').countDocuments();

    console.log(`   - Total transactions: ${total}`);
    console.log(`   - Transactions with status='pending': ${pendingCount} (should equal total)`);
    console.log(`   - Transactions with createdRecordId: ${hasRecordId} (should be 0)`);

    if (pendingCount === total && hasRecordId === 0) {
      console.log('\n🎉 SUCCESS! All transactions reset to pending and ready for testing!');
    } else {
      console.log('\n⚠️  WARNING: Reset incomplete');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

resetAllTransactions();
