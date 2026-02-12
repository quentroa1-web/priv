require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const testUpdate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const res = await User.findByIdAndUpdate('698aac460cea72457c16ab81', {
            verificationRequests: {
                idProof: 'https://res.cloudinary.com/demo/image/upload/id.jpg',
                photoProof: 'https://res.cloudinary.com/demo/image/upload/photo.jpg',
                status: 'pending',
                requestedAt: Date.now()
            }
        }, { new: true });

        if (!res) {
            console.log('User not found');
        } else {
            console.log('User updated:');
            console.log(JSON.stringify(res.verificationRequests, null, 2));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

testUpdate();
