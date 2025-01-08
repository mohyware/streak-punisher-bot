const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    leetcode_username: { type: String, default: null },
    codeforces_username: { type: String, default: null },
    leetcode_totalSubmissions: { type: Number, default: 0 },
    leetcode_acSubmissions: { type: Number, default: 0 },
    codeforces_totalSubmissions: { type: Number, default: 0 },
    codeforces_acSubmissions: { type: Number, default: 0 },
    other_acSubmissions: { type: Number, default: 0 },
    total_acSubmissions: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastSubmissionDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-update the updatedAt field
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
