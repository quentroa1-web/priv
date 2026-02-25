const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables');
    return;
  }

  // Log a masked version of the URI for debugging
  const maskedUri = uri.replace(/\/\/[^:]+:([^@]+)@/, '//user:****@');
  console.log(`Attempting to connect to MongoDB: ${maskedUri}`);


  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4 to avoid some Vercel/Atlas networking issues
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error Technical Details:`);
    console.error(`- Message: ${error.message}`);
    console.error(`- Code: ${error.code}`);
    console.error(`- Name: ${error.name}`);

    // Fallback to local only if NOT in production
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
  }
};




module.exports = connectDB;
