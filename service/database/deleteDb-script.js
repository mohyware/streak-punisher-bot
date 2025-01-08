const mongoose = require('mongoose');
require('dotenv').config();

// Replace with your MongoDB URI
const mongoURI = process.env.MONGO_URI;

// Define a simple User model (if you don't have one already)
const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    leetcode_username: String,
    codeforces_username: String
}));

// Connect to MongoDB
mongoose.connect(mongoURI, {})
    .then(() => {
        console.log('Connected to MongoDB');

        // Delete all documents from the 'User' collection
        User.deleteMany({})
            .then(result => {
                console.log('All users deleted:', result);
                mongoose.connection.close();  // Close the connection
            })
            .catch(err => {
                console.error('Error deleting documents:', err);
                mongoose.connection.close();  // Close the connection on error
            });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
