const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    const email = 'admin@safeconnect.com';
    const password = 'admin123456';

    // Check if admin already exists
    const adminExists = await User.findOne({ email });
    if (adminExists) {
      console.log('Admin user already exists. Updating role to admin...');
      adminExists.role = 'admin';
      await adminExists.save();
      console.log('Admin role updated successfully.');
    } else {
      // Create admin user
      await User.create({
        name: 'SafeConnect Admin',
        email: email,
        password: password,
        role: 'admin',
        verified: true
      });
      console.log('Admin user created successfully.');
    }

    console.log('Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
