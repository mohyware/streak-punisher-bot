const ProblemController = require('../controllers/problem-controller');
const User = require('../models/user-model');
const Problem = require('../models/problem-model');
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

const generateLargeRandomNumber = () => {
    const min = 10n ** 17n;
    const max = (10n ** 18n) - 1n;

    const randomNumber = min + BigInt(Math.floor(Math.random() * Number(max - min + 1n)));
    return randomNumber.toString();
};

const addProblems = async (input, message) => {
    try {
        const discordId = message.author.id;

        // Extract the platform and problems
        const [platformWithProblems] = input;
        const [platform, ...problems] = platformWithProblems.split("\n");

        if (!platform || problems.length === 0) {
            return message.reply(
                '❗ **Invalid input format.** Ensure the format is `platform\\nproblem1\\nproblem2...`\n' +
                '💡 **Example:** `vjudge\\n2062-A\\n2063-A\\n2065-A`'
            );
        }

        for (const problemId of problems) {
            if (!problemId.trim()) continue;

            console.log(`Adding problem ${platform.trim()} ${problemId.trim()} for ${discordId}`);

            try {
                await ProblemController.addProblem(
                    problemId.trim(),
                    problemId.trim(),
                    platform.trim(),
                    generateLargeRandomNumber(),
                    discordId
                );

                // Notify user about successful addition
                message.reply(`✅ **Problem ${platform} ${problemId.trim()} added successfully!** 🎉`);
            } catch (error) {
                if (error.code === 11000 || error.message.includes('duplicate') || error.message.includes('Problem already exists')) {
                    message.reply(`⚠️ **Problem ${platform} ${problemId.trim()} already exists.** Skipping.`);
                } else {
                    message.reply(`❗ **Failed to add problem ${platform} ${problemId.trim()} due to an error.**`);
                }
                console.error(`Error adding problem ${problemId.trim()}:`, error);
            }

        }
    } catch (error) {
        console.error("Error adding problems:", error);
        message.reply(`❗ **An error occurred while adding problems.** Please try again later.`);
    }
};

const getAllUserStatistics = async (args, message) => {
    if (message.author.id !== process.env.OWNER_ID) {
        return message.reply('❌ You do not have permission to execute this command.');
    }
    try {
        const users = await User.find();
        const userStatsPromises = users.map(async (user) => {
            const problemCount = await Problem.countDocuments({ user: user._id }) + user.other_acSubmissions;
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
                topPerformer = `🥇 **${process.env.TOP_MSG || 'Top Performer:'}:** ${userMention} (${userStat.name})\n` +
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
            message.reply(topPerformer.trim());
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

const reminder = async (args, message) => {
    if (message.author.id !== process.env.OWNER_ID) {
        return message.reply('❌ You do not have permission to execute this command.');
    }
    try {
        const users = await User.find();
        const userStatsPromises = users.map(async (user) => {
            await ProblemController.updateUserProblems(user.discordId);
            const problemCount = await Problem.countDocuments({ user: user._id }) + user.other_acSubmissions;
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

        // Filter users who haven't solved anything today
        let failedUsers = allUserStats
            .filter(userStat => userStat.todaySolved === 0)
            .map(userStat => `💀 **${'حل قبل ما الضعف يحل'}:** <@${userStat.discordId}> (${userStat.name})`)
            .join('\n');

        if (failedUsers) {
            message.reply(failedUsers.trim());
        } else {
            message.reply('✅ Everyone solved at least one problem today!');
        }
    } catch (error) {
        message.reply('❌ An error occurred while fetching statistics. Please try again later.');
    }
};

const setOtherProblemsCount = async (args, message) => {
    try {
        const [count] = args;
        const discordId = message.author.id;
        if (!count || isNaN(count)) {
            return message.reply('❗ **Usage:** `!setotherproblems <count>`\n' +
                '💡 **Example:** `!setotherproblems 123`');
        }
        await ProblemController.setOtherProblemsCount(count, discordId);
        message.reply(`✅ **Other problems count set successfully!** 🎉`);
    } catch (error) {
        throw error;
    }
};

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
    addProblems,
    deleteProblem,
    getAllUserStatistics,
    setOtherProblemsCount,
    reminder
};