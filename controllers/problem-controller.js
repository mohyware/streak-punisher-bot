const Problem = require('../models/problem-model');
const User = require('../models/user-model');

const searchForProblem = async (searchQuery, userId) => {
    let problem = await Problem.findOne({ problemId: searchQuery, user: userId });

    if (!problem) {
        problem = await Problem.findOne({ submissionId: searchQuery });
    }

    if (!problem) {
        return null;
    }

    return problem;
};

const getProblem = async (searchQuery) => {
    const problem = await searchForProblem(searchQuery);
    return problem;
};

const addProblem = async (problemId, title, platform, submissionId, discord_Id) => {
    const user = await User.findOne({ discordId: discord_Id });

    const problemCheck = await searchForProblem(problemId, user._id) || await searchForProblem(submissionId, user._id);

    if (problemCheck) {
        throw new Error('Problem already exists');
    }

    if (!user) {
        throw new Error('User not found');
    }

    const problem = new Problem({
        problemId,
        title,
        submissionId,
        platform,
        user: user._id,
    });

    await problem.save();
    return problem;
};

const deleteProblem = async (searchQuery, discordId) => {
    const user = await User.findOne({ discordId });

    const problem = await searchForProblem(searchQuery, user._id);
    if (!problem) {
        throw new Error('Problem not found');
    }
    const deletedProblem = await Problem.findOneAndDelete({ problemId: problem.problemId });
    return deletedProblem;
};

module.exports = {
    getProblem,
    addProblem,
    deleteProblem,
};
