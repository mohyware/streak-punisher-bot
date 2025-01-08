const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('Connected to MongoDB');
        await mongoose.model('User').syncIndexes();
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process if unable to connect
    }
};

module.exports = connectToDatabase;
