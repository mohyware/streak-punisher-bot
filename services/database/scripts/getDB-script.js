const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../../../models/user-model');
const Problem = require('../../../models/problem-model');

// Replace with your MongoDB URI
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoURI, {})
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            // Fetch all documents from the 'User' collection
            const users = await User.find();
            console.log('Users:', users);

            // Fetch all documents from the 'Problem' collection
            const problems = await Problem.find();
            console.log('Problems:', problems);
        } catch (err) {
            console.error('Error fetching documents:', err);
        } finally {
            // Close the connection
            mongoose.connection.close();
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
