const ProblemController = require('../controllers/problem-controller');
const User = require('../models/user-model');
const { formatProblems } = require('../utils/user-formatter');
const addProblem = async (args, message) => {
    try {
        const [problemId, title, platform, submissionId] = args;
        const discordId = message.author.id;
        if (!problemId || !title || !platform) {
            return message.reply(
                '❗ **Usage:** `!addproblem <problemId> <title> <platform> <submissionId (optional)>`\n' +
                '💡 **Example:** `!addproblem 123 "Two Sum" leetcode 456`'
            );
        }

        await ProblemController.addProblem(problemId, title, platform, submissionId, discordId);
        message.reply(`✅ **Problem ${title} added successfully!** 🎉`);
    } catch (error) {
        throw error;
    }
};

const getAllUserStatistics = async (args, message) => {
    try {
        const users = await User.find();
        const userStatsPromises = users.map(async (user) => {
            const todayStats = await ProblemController.getTodayStats(user.discordId);
            return {
                discordId: user.discordId,
                name: user.name,
                todaySolved: todayStats.todaySolved.length,
                totalSolved: user.total_acSubmissions,
                streak: user.streak,
                problems: todayStats
            };
        });

        let allUserStats = await Promise.all(userStatsPromises);

        allUserStats.sort((a, b) => {
            if (b.streak !== a.streak) {
                return b.streak - a.streak;
            }
            if (b.todaySolved !== a.todaySolved) {
                return b.todaySolved - a.todaySolved;
            }
            return b.totalSolved - a.totalSolved;
        });

        // Format the statistics for the Discord message
        const mainStatsMessage = allUserStats
            .map((userStat, index) => {
                const statsFormatted = formatProblems(userStat.problems)
                return (
                    `**${index + 1}.** <@${userStat.discordId}> 🎯  Streak: **${userStat.streak}**, ` +
                    `📅 Today Solved: **${userStat.todaySolved}**, 🌟 Total Solved: **${userStat.totalSolved}**\n` +
                    statsFormatted
                );
            }
            )
            .join('\n');

        message.reply(mainStatsMessage);
    } catch (error) {
        throw error;
    }
}

const deleteProblem = async (args, message) => {
    try {
        const searchQuery = args[0];
        const discordId = message.author.id;
        if (!searchQuery) {
            return message.reply(
                '❗ **Usage:** `!deleteproblem <problemId|submissionId>`\n' +
                '💡 **Example:** `!deleteproblem 123`'
            );
        }
        await ProblemController.deleteProblem(searchQuery, discordId);
        message.reply(`✅ **Problem ${searchQuery} deleted successfully!** 🎉`);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    addProblem,
    deleteProblem,
    getAllUserStatistics
};