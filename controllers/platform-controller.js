const User = require('../models/user-model');
const codeforces = require('../services/apis/codeforces');
const leetcode = require('../services/apis/leetcode');
const { CF_problemsFormatter } = require('../utils/codeforces-formatter')
const { LC_problemsFormatter } = require('../utils/leetcode-formatter')
const CustomError = require('../utils/custom-error');

const addLeetcodeProblems = async (leetcode_username) => {
    try {
        const stats = await leetcode.fetchUserStats(leetcode_username);
        return stats[0].count;
    } catch (error) {
        throw new CustomError('Error fetching leetcode problems');
    }
}

const addCodeforcesProblems = async (codeforces_username) => {
    try {
        const stats = await codeforces.fetchUserStats(codeforces_username);
        return stats.totalUniqueAccepted;
    } catch (error) {
        throw new CustomError('Error fetching codeforces problems');
    }
}


const getCodeforcesProblems = async (codeforces_username) => {
    try {
        const submissions = await codeforces.fetchRecentSubmissions(codeforces_username);
        const formatted = CF_problemsFormatter(submissions, codeforces_username);
        return formatted;
    } catch (error) {
        throw new Error('Error fetching codeforces problems');
    }
}


const getLeetcodeProblems = async (leetcode_username) => {
    try {
        const submissions = await leetcode.fetchRecentSubmissions(leetcode_username);
        const formatted = LC_problemsFormatter(submissions, leetcode_username);
        return formatted;
    } catch (error) {
        throw new Error("Error fetching leetcode problems");
    }
}

module.exports = {
    addLeetcodeProblems,
    addCodeforcesProblems,
    getCodeforcesProblems,
    getLeetcodeProblems
};