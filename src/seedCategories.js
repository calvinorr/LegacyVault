// src/seedCategories.js
// Seed script for default UK financial categories
// Run with: node src/seedCategories.js

const mongoose = require('mongoose');
const Category = require('./models/category');
const User = require('./models/user');

// UK-focused financial categories structure
const UK_FINANCIAL_CATEGORIES = [
  {
    name: 'Banking',
    description: 'Banking accounts and services',
    children: [
      { name: 'Current Accounts', description: 'Day-to-day banking accounts' },
      { name: 'Savings Accounts', description: 'Savings and deposit accounts' },
      { name: 'ISAs', description: 'Individual Savings Accounts' },
      { name: 'Credit Cards', description: 'Credit card accounts' },
      { name: 'Loans', description: 'Personal loans and mortgages' },
      { name: 'Overdrafts', description: 'Overdraft facilities' }
    ]
  },
  {
    name: 'Bills',
    description: 'Household bills and services',
    children: [
      { name: 'Council Tax', description: 'Local council tax payments' },
      { name: 'Gas', description: 'Gas supply and heating' },
      { name: 'Electricity', description: 'Electricity supply' },
      { name: 'Water', description: 'Water and sewerage services' },
      { name: 'Broadband', description: 'Internet and broadband services' },
      { name: 'Mobile Phone', description: 'Mobile phone services' },
      { name: 'Landline', description: 'Fixed line telephone services' },
      { name: 'TV Licence', description: 'BBC TV licence' },
      { name: 'Waste Collection', description: 'Refuse and recycling services' }
    ]
  },
  {
    name: 'Insurance',
    description: 'Insurance policies and coverage',
    children: [
      { name: 'Home Insurance', description: 'Buildings and contents insurance' },
      { name: 'Car Insurance', description: 'Motor vehicle insurance' },
      { name: 'Life Insurance', description: 'Life assurance policies' },
      { name: 'Travel Insurance', description: 'Holiday and travel insurance' },
      { name: 'Pet Insurance', description: 'Animal and pet insurance' },
      { name: 'Health Insurance', description: 'Private medical insurance' },
      { name: 'Income Protection', description: 'Income protection insurance' }
    ]
  },
  {
    name: 'Investments',
    description: 'Investment accounts and portfolios',
    children: [
      { name: 'Stocks & Shares', description: 'Individual stock holdings' },
      { name: 'Investment ISAs', description: 'Stocks & Shares ISAs' },
      { name: 'Unit Trusts', description: 'Unit trust investments' },
      { name: 'Investment Trusts', description: 'Investment trust holdings' },
      { name: 'Premium Bonds', description: 'National Savings Premium Bonds' },
      { name: 'Bonds', description: 'Government and corporate bonds' },
      { name: 'Funds', description: 'Investment fund holdings' }
    ]
  },
  {
    name: 'Pensions',
    description: 'Pension schemes and retirement planning',
    children: [
      { name: 'Workplace Pensions', description: 'Company pension schemes' },
      { name: 'Personal Pensions', description: 'Private pension plans' },
      { name: 'SIPPs', description: 'Self-Invested Personal Pensions' },
      { name: 'State Pension', description: 'UK State Pension entitlements' },
      { name: 'Final Salary', description: 'Defined benefit pension schemes' },
      { name: 'Stakeholder Pensions', description: 'Stakeholder pension schemes' }
    ]
  },
  {
    name: 'Property',
    description: 'Property ownership and rental',
    children: [
      { name: 'Mortgage', description: 'Residential mortgage accounts' },
      { name: 'Rental Income', description: 'Buy-to-let rental properties' },
      { name: 'Property Investments', description: 'Investment properties' },
      { name: 'Shared Ownership', description: 'Shared ownership schemes' },
      { name: 'Help to Buy', description: 'Government Help to Buy schemes' }
    ]
  },
  {
    name: 'Subscriptions',
    description: 'Regular subscription services',
    children: [
      { name: 'Streaming Services', description: 'Netflix, Amazon Prime, etc.' },
      { name: 'News & Media', description: 'Newspaper and magazine subscriptions' },
      { name: 'Software', description: 'Software and app subscriptions' },
      { name: 'Gym & Health', description: 'Gym memberships and health services' },
      { name: 'Professional Services', description: 'Professional subscription services' }
    ]
  },
  {
    name: 'Government',
    description: 'Government services and benefits',
    children: [
      { name: 'HMRC', description: 'Tax and revenue services' },
      { name: 'Benefits', description: 'Social security benefits' },
      { name: 'DVLA', description: 'Vehicle licensing and registration' },
      { name: 'Passport Office', description: 'Passport services' },
      { name: 'Court Services', description: 'Legal and court services' }
    ]
  },
  {
    name: 'Healthcare',
    description: 'Healthcare services and providers',
    children: [
      { name: 'NHS', description: 'National Health Service' },
      { name: 'Private Healthcare', description: 'Private medical services' },
      { name: 'Dental', description: 'Dental care services' },
      { name: 'Optical', description: 'Eye care and optical services' },
      { name: 'Pharmacy', description: 'Prescription and pharmacy services' }
    ]
  },
  {
    name: 'Other',
    description: 'Other financial accounts and services',
    children: [
      { name: 'Legal Services', description: 'Solicitors and legal services' },
      { name: 'Accounting', description: 'Accountancy and tax services' },
      { name: 'Childcare', description: 'Nursery and childcare services' },
      { name: 'Education', description: 'School fees and educational services' },
      { name: 'Charity', description: 'Charitable donations and giving' }
    ]
  }
];

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/legacylock';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Find or create system admin user for category ownership
async function getSystemAdminUser() {
  let adminUser = await User.findOne({ 
    role: 'admin',
    email: 'system@legacylock.com'
  });

  if (!adminUser) {
    adminUser = new User({
      googleId: 'system-admin',
      displayName: 'System Administrator',
      email: 'system@legacylock.com',
      role: 'admin',
      approved: true
    });
    await adminUser.save();
    console.log('Created system admin user for category ownership');
  }

  return adminUser;
}

// Seed categories for a specific user (or system)
async function seedCategoriesForUser(userId, isSystemCategories = false) {
  console.log(`Seeding categories for user: ${userId}`);
  
  // Check if categories already exist for this user
  const existingCount = await Category.countDocuments({ 
    userId: userId,
    isDeleted: false
  });
  
  if (existingCount > 0) {
    console.log(`User already has ${existingCount} categories. Skipping seed.`);
    return;
  }

  const createdCategories = [];
  
  // Create root categories first
  for (const rootCategoryData of UK_FINANCIAL_CATEGORIES) {
    const rootCategory = new Category({
      name: rootCategoryData.name,
      description: rootCategoryData.description,
      userId: userId,
      isSystemCategory: isSystemCategories
    });
    
    await rootCategory.save();
    createdCategories.push(rootCategory);
    console.log(`Created root category: ${rootCategory.name}`);
    
    // Create child categories
    if (rootCategoryData.children) {
      for (const childData of rootCategoryData.children) {
        const childCategory = new Category({
          name: childData.name,
          description: childData.description,
          parentId: rootCategory._id,
          userId: userId,
          isSystemCategory: isSystemCategories
        });
        
        await childCategory.save();
        createdCategories.push(childCategory);
        console.log(`  Created child category: ${childCategory.name}`);
      }
    }
  }
  
  console.log(`Successfully created ${createdCategories.length} categories`);
  return createdCategories;
}

// Main seeding function
async function seedCategories() {
  try {
    await connectToDatabase();
    
    // Get system admin user
    const systemUser = await getSystemAdminUser();
    
    // Create system categories
    await seedCategoriesForUser(systemUser._id, true);
    
    console.log('Category seeding completed successfully');
    
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Function to seed categories for a specific existing user
async function seedCategoriesForExistingUser(userEmail) {
  try {
    await connectToDatabase();
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      throw new Error(`User with email ${userEmail} not found`);
    }
    
    await seedCategoriesForUser(user._id, false);
    
    console.log(`Categories seeded for user: ${userEmail}`);
    
  } catch (error) {
    console.error('Error seeding categories for user:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Export functions for use in other modules
module.exports = {
  seedCategories,
  seedCategoriesForUser,
  seedCategoriesForExistingUser,
  UK_FINANCIAL_CATEGORIES
};

// Run seeding if script is called directly
if (require.main === module) {
  const command = process.argv[2];
  const userEmail = process.argv[3];
  
  if (command === 'user' && userEmail) {
    seedCategoriesForExistingUser(userEmail);
  } else {
    seedCategories();
  }
}