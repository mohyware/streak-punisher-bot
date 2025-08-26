const Problem = require('../models/problem-model');
const User = require('../models/user-model');
const CustomError = require('../utils/custom-error');
const platformController = require('../controllers/platform-controller')
const moment = require('moment-timezone');

const searchForProblem = async (searchQuery, userId) => {
    try {
        let problem = await Problem.findOne({ problemId: searchQuery, user: userId });

        if (!problem) {
            problem = await Problem.findOne({ submissionId: searchQuery });
        }

        return problem;
    } catch (error) {
        throw error;
    }
};

const getProblem = async (searchQuery) => {
    const problem = await searchForProblem(searchQuery);
    if (!problem) {
        throw new CustomError('Problem not found');
    }
    return problem;
};

const addProblem = async (problemId, title, platform, submissionId, discord_Id) => {
    const user = await User.findOne({ discordId: discord_Id });

    const problemCheck = await searchForProblem(problemId, user._id) || await searchForProblem(submissionId, user._id);

    if (problemCheck) {
        throw new CustomError('Problem already exists');
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

const getTodayStats = async (discordId) => {
    try {
        const user = await User.findOne({ discordId });
        if (!user) {
            throw new Error('User not found');
        }

        // Get current date in local timezone
        const localTimeZoneDate = moment.tz(process.env.TIMEZONE);
        const todayStart = localTimeZoneDate.startOf('day').toDate();

        // return today problems
        const todaySolved = await Problem.find({ user: user._id, createdAt: { $gte: todayStart } });

        return {
            todaySolved,
        };
    } catch (error) {
        throw new Error('Error fetching user streak');
    }
}

const updateUserProblems = async (discordId) => {
    try {

        const user = await User.findOne({ discordId });
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.leetcode_username && !user.codeforces_username) {
            throw new Error('User does not have a LeetCode or Codeforces username');
        }

        const leetcodeProblems = user.leetcode_username
            ? await platformController.getLeetcodeProblems(user.leetcode_username)
            : [];
        const codeforcesProblems = user.codeforces_username
            ? await platformController.getCodeforcesProblems(user.codeforces_username)
            : [];

        const allProblems = [...leetcodeProblems, ...codeforcesProblems];

        const submissions = allProblems.map((problem) => ({
            ...problem,
            user: user._id,
            submissionId: problem.submissionId,
        }));

        try {
            await Problem.insertMany(submissions, { ordered: false });
        } catch (error) {
            if (error.code === 11000 || error.message.includes('duplicate')) {
                return null; // Return false for duplicates (no new problems)
            }
            throw new Error('Error inserting problems to database');
        }

        if (allProblems.length > 0) {
            const lastSubmission = allProblems.reduce((latest, current) =>
                latest.createdAt > current.createdAt ? latest : current
            );

            // check if there is any manual added problems that is more recent than the last submission
            if (!user.lastSubmissionDate || lastSubmission.createdAt > user.lastSubmissionDate) {
                user.lastSubmissionDate = lastSubmission.createdAt;
                await user.save();
            }
        }

        return user;
    } catch (error) {
        throw error;
    }
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

const setOtherProblemsCount = async (count, discordId) => {
    try {
        const user = await User.findOneAndUpdate(
            { discordId },
            { other_acSubmissions: count },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }
        await user.save();

    } catch (error) {
        console.log(error)
        throw error;
    }
}

module.exports = {
    getProblem,
    addProblem,
    deleteProblem,
    updateUserProblems,
    getTodayStats,
    setOtherProblemsCount
};
