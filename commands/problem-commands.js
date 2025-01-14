const ProblemController = require('../controllers/problem-controller');
const User = require('../models/user-model');
const Problem = require('../models/problem-model');
const { formatProblems } = require('../utils/user-formatter');
const { AttachmentBuilder } = require('discord.js');

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
    if (message.author.id !== process.env.OWNER_ID) {
        return message.reply('❌ You do not have permission to execute this command.');
    }
    try {
        const users = await User.find();
        const userStatsPromises = users.map(async (user) => {
            const problemCount = await Problem.countDocuments({ user: user._id });
            const todayStats = await ProblemController.getTodayStats(user.discordId);
            return {
                discordId: user.discordId,
                name: user.name,
                todaySolved: todayStats.todaySolved.length,
                totalSolved: problemCount,
                streak: user.streak,
                problems: todayStats,
            };
        });

        let allUserStats = await Promise.all(userStatsPromises);

        // Sort by streak, then today's solves, then total solved problems
        allUserStats.sort((a, b) => {
            if (b.streak !== a.streak) return b.streak - a.streak;
            if (b.todaySolved !== a.todaySolved) return b.todaySolved - a.todaySolved;
            return b.totalSolved - a.totalSolved;
        });

        // Prepare the message
        let mainStatsMessage = "";
        let failedUsers = "";
        let topPerformer = "";

        allUserStats.forEach((userStat, index) => {
            const statsFormatted = formatProblems(userStat.problems); // Assuming this formats today's solved problems
            const userMention = `<@${userStat.discordId}>`;

            if (index === 0 && userStat.streak > 0) {
                // Special message for the top performer
                topPerformer = `🥇 **Top Performer:** ${userMention} (${userStat.name})\n` +
                    `🎯 Streak: **${userStat.streak}**, 📅 Today Solved: **${userStat.todaySolved}**, 🌟 Total Solved: **${userStat.totalSolved}**\n` +
                    statsFormatted + '\n\n';
            } else if (userStat.streak === 0) {
                // Special message for users who haven't solved anything
                failedUsers += `⚠️ **${process.env.FAIL_MSG || 'No Solves Yet'}:** ${userMention} (${userStat.name})\n`
            } else {
                // Normal message for others
                mainStatsMessage += `**${index + 1}.** ${userMention} (${userStat.name})\n` +
                    `🎯 Streak: **${userStat.streak}**, 📅 Today Solved: **${userStat.todaySolved}**, 🌟 Total Solved: **${userStat.totalSolved}**\n` +
                    statsFormatted + '\n\n';
            }
        });

        if (topPerformer) {
            await sendTopPerformer(topPerformer, message);
        }
        if (mainStatsMessage) {
            message.reply(mainStatsMessage.trim());
        }
        if (failedUsers) {
            message.reply(failedUsers.trim());
        }
    } catch (error) {
        message.reply('❌ An error occurred while fetching statistics. Please try again later.');
    }
};

async function sendTopPerformer(topPerformer, message) {
    if (topPerformer) {
        const sigma = new AttachmentBuilder('./assets/sigma.mp4', 'sigma.mp4');
        await message.reply({
            content: topPerformer.trim(),
            files: [sigma],
        });
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
    getAllUserStatistics,
};