require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const testSave = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findById('698aac460cea72457c16ab81');
        if (!user) {
            console.log('User not found');
            return;
        }

        user.verificationRequests = {
            idProof: 'https://res.cloudinary.com/demo/image/upload/id.jpg',
            photoProof: 'https://res.cloudinary.com/demo/image/upload/photo.jpg',
            status: 'pending',
            requestedAt: Date.now()
        };

        const saved = await user.save();
        console.log('User saved:');
        console.log(JSON.stringify(saved.verificationRequests, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

testSave();
