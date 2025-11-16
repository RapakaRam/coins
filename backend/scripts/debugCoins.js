require('dotenv').config();
const mongoose = require('mongoose');
const Coin = require('../models/Coin');

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const total = await Coin.countDocuments();
  console.log('Total coins in DB:', total);

  const byUser = await Coin.aggregate([
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);
  console.log('Counts by userId:');
  console.table(byUser);

  const byCountry = await Coin.aggregate([
    { $group: { _id: '$countryId', count: { $sum: 1 } } },
  ]);
  console.log('Counts by countryId:');
  console.table(byCountry);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
