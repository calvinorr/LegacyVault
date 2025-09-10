// Simple script to add sample data for testing
const mongoose = require('mongoose');
const Entry = require('./models/entry');
const User = require('./models/user');

// Sample entries for testing
const sampleEntries = [
  {
    title: 'Chase Checking Account',
    type: 'account',
    provider: 'Chase Bank',
    notes: 'Primary checking account for daily expenses',
    accountDetails: { accountNumber: '**** 1234', routingNumber: '021000021' }
  },
  {
    title: 'Bank of America Savings',
    type: 'account', 
    provider: 'Bank of America',
    notes: 'Emergency fund savings account',
    accountDetails: { accountNumber: '**** 5678', apy: '0.01%' }
  },
  {
    title: 'Wells Fargo Credit Card',
    type: 'account',
    provider: 'Wells Fargo',
    notes: 'Primary credit card for purchases',
    accountDetails: { accountNumber: '**** 3456', limit: '$10,000' }
  },
  {
    title: 'Vanguard 401k Investment Account',
    type: 'other',
    provider: 'Vanguard',
    notes: 'Company 401k retirement account - investments',
    accountDetails: { accountNumber: '**** 9012', balance: '$45,000', category: 'investment' }
  },
  {
    title: 'Main Residence Property',
    type: 'other',
    provider: 'Self-owned',
    notes: '3-bedroom house purchased in 2020',
    accountDetails: { address: '123 Main St', value: '$350,000', mortgage: 'Yes', category: 'property' }
  },
  {
    title: 'Electric Company',
    type: 'bill',
    provider: 'PG&E',
    notes: 'Monthly electric service',
    accountDetails: { accountNumber: '987654321', averageBill: '$120' }
  },
  {
    title: 'Comcast Internet',
    type: 'bill',
    provider: 'Comcast',
    notes: 'High-speed internet service',
    accountDetails: { accountNumber: '555-123-456', plan: 'Gigabit' }
  },
  {
    title: 'Car Insurance Policy',
    type: 'policy',
    provider: 'State Farm',
    notes: 'Auto insurance for primary vehicle',
    accountDetails: { policyNumber: 'SF-123456', premium: '$150/month' }
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/household-finance';
    await mongoose.connect(mongoUri);
    
    console.log('Connected to MongoDB');
    
    // Create or find test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        googleId: 'test-google-id-12345',
        displayName: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        approved: true
      });
      console.log('Created test user');
    } else {
      console.log('Found existing test user');
    }
    
    // Clear existing entries (optional)
    await Entry.deleteMany({});
    console.log('Cleared existing entries');
    
    // Add owner field to sample entries
    const entriesWithOwner = sampleEntries.map(entry => ({
      ...entry,
      owner: testUser._id,
      lastUpdatedBy: testUser._id
    }));
    
    // Insert sample data
    const insertedEntries = await Entry.insertMany(entriesWithOwner);
    console.log(`Inserted ${insertedEntries.length} sample entries`);
    
    // Display what was inserted
    insertedEntries.forEach(entry => {
      console.log(`- ${entry.type}: ${entry.title} (${entry.provider})`);
    });
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData, sampleEntries };