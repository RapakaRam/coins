const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ Error: MONGO_URI is not defined in .env file');
      console.error('Please create a .env file with your MongoDB connection string.');
      console.error('Example: MONGO_URI=mongodb://localhost:27017/coin-collector');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Please check your MONGO_URI in the .env file');
    process.exit(1);
  }
};

module.exports = connectDB;

