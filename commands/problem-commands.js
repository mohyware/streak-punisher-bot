const ProblemController = require('../controllers/problem-controller');

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
    deleteProblem
};