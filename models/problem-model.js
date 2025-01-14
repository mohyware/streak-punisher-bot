const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    problemId: { type: String, required: true },
    title: { type: String, required: true },
    platform: { type: String, required: true },
    submissionId: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
problemSchema.index({ user: 1, problemId: 1 }, { unique: true });

// Auto-update the updatedAt field
problemSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
