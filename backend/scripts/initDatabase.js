require('dotenv').config();
const mongoose = require('mongoose');
const Location = require('../models/Location');
const User = require('../models/User');
const Coin = require('../models/Coin');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for initialization');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const initDatabase = async () => {
  try {
    await connectDB();

    console.log('Initializing database...\n');

    // Create indexes for better query performance
    console.log('Creating indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('✓ User indexes created');

    // Location indexes
    await Location.collection.createIndex({ type: 1, displayOrder: 1 });
    await Location.collection.createIndex({ type: 1, parent: 1 });
    await Location.collection.createIndex({ name: 1 });
    console.log('✓ Location indexes created');

    // Coin indexes
    await Coin.collection.createIndex({ userId: 1, countryId: 1 });
    await Coin.collection.createIndex({ countryId: 1 });
    await Coin.collection.createIndex({ uploadedAt: -1 });
    console.log('✓ Coin indexes created');

    // Check if database is already seeded
    const continentCount = await Location.countDocuments({ type: 'continent' });
    
    if (continentCount === 0) {
      console.log('\n⚠️  Database is empty. Run "npm run seed" to populate continents and countries.');
    } else {
      console.log(`\n✓ Database already contains ${continentCount} continents.`);
      const countryCount = await Location.countDocuments({ type: 'country' });
      console.log(`✓ Database contains ${countryCount} countries.`);
    }

    console.log('\n✅ Database initialization complete!');
    console.log('\nCollections will be created automatically when you:');
    console.log('  - Register/login (creates "users" collection)');
    console.log('  - Run seed script (creates "locations" collection)');
    console.log('  - Upload a coin (creates "coins" collection)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();

