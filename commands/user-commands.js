const UserController = require('../controllers/user-controller');
const problemController = require('../controllers/problem-controller');
const { formatUserData, formatProblems } = require('../utils/user-formatter');
const User = require('../models/user-model');
const Problem = require('../models/problem-model');

const addUser = async (args, message) => {
    try {
        const [name, leetcode_username, codeforces_username] = args;
        const discordId = message.author.id;
        if (!name || (!leetcode_username && !codeforces_username) ||
            (leetcode_username === 'null' && codeforces_username === 'null')) {
            return message.reply(
                '❗ **Usage:** `!adduser <name> <leetcode_username (optional)> <codeforces_username (optional)>`\n' +
                'ℹ️ If you don\'t have a username for one of the platforms, enter `null`.\n' +
                '💡 **Example:** `!adduser mohy null mohyware`'
            );
        }

        await UserController.addUser(name, leetcode_username, codeforces_username, discordId);
        await problemController.updateUserProblems(discordId);
        message.reply(`✅ **User ${name} added successfully!** 🎉`);
    } catch (error) {
        throw error;
    }
};

const getUser = async (args, message) => {
    try {
        const searchQuery = args[0];
        if (!searchQuery) {
            return message.reply(
                '❗ **Usage:** `!getuser <name|codeforces_username|leetcode_username>`'
            );
        }

        const user = await UserController.getUser(searchQuery);
        if (!user) {
            return message.reply(`❌ **No user found** with query: \`${searchQuery}\` 🔍`);
        }
        const problemCount = await Problem.countDocuments({ user: user._id }) + user.other_acSubmissions;

        const data = formatUserData(user, problemCount);

        const stats = await problemController.getTodayStats(user.discordId);
        if (stats && stats.todaySolved && stats.todaySolved.length > 0) {
            const statsFormatted = formatProblems(stats);
            const finalOutput = `${data}\n${statsFormatted}`;
            message.reply(finalOutput);
        } else {
            const finalOutput = `${data}\n\n❗ **No Solved Problems for this user today.**`;
            message.reply(finalOutput);
        }

        if (!user) {
            return message.reply(`❌ **No user found** with search query: \`${searchQuery}\` 🔍`);
        }
    } catch (error) {
        throw error;
    }
};

const updateUser = async (args, message) => {
    try {
        const [name, newLeetcodeUsername, newCodeforcesUsername] = args;

        if (!name || !newLeetcodeUsername || !newCodeforcesUsername) {
            return message.reply(
                '❗ **Usage:** `!rename <name> <new_leetcode_username> <new_codeforces_username>`'
            );
        }

        const user = await UserController.updateUser(name, newLeetcodeUsername, newCodeforcesUsername);

        if (!user) {
            return message.reply(`❌ **No user found** with name: \`${name}\` 🔍`);
        }

        message.reply(`✅ **User ${user.name}'s data updated successfully!** 🔄`);
    } catch (error) {
        throw error;
    }
};

const deleteUser = async (args, message) => {
    try {
        const searchQuery = args[0];

        if (!searchQuery) {
            return message.reply(
                '❗ **Usage:** `!deleteuser <name|codeforces_username|leetcode_username>`'
            );
        }

        const user = await UserController.deleteUser(searchQuery);
        if (!user) {
            return message.reply(`❌ **No user found** with query: \`${searchQuery}\` 🔍`);
        }

        message.reply(`🗑️ **User ${user.name} deleted successfully!**`);
    } catch (error) {
        throw error;
    }
};

const updateStreak = async (args, message) => {
    try {

        if (message.author.id !== process.env.OWNER_ID) {
            return message.reply('❌ You do not have permission to execute this command.');
        }


        const users = await User.find();

        for (const user of users) {
            const todayStats = await problemController.getTodayStats(user.discordId);

            if (todayStats.todaySolved.length > 0) {
                user.streak += 1;
            } else {
                user.streak = 0;
            }

            await user.save();
        }

        message.reply('✅ **Streaks updated successfully!**');
    } catch (error) {
        throw error;
    }
};

const setStreak = async (args, message) => {
    try {
        if (message.author.id !== process.env.OWNER_ID) {
            return message.reply('❌ You do not have permission to execute this command.');
        }
        const mention = args[0];
        const streak = args[1];

        const match = mention.match(/^<@(\d+)>$/);
        if (match) {
            discordId = match[1];
        }

        const user = await User.findOne({ discordId });

        if (!streak) {
            return message.reply('❗ **Usage:** `!setstreak <username> <streak>`');
        }

        user.streak = parseInt(streak);
        await user.save();
        message.reply(`✅ **Streak updated successfully!**`);
    } catch (error) {
        throw error;
    }
}

const helpMessage = async (message) => {
    try {
        const helpMessage = `
        **Help Menu**
        
        Welcome to the bot! Here are the available commands:
        
        **User Commands:**
        
        - \`!join <username> <leetcode_username (optional)> <codeforces_username (optional)>\` - To join.
        - \`!getuser <name|codeforces_username|leetcode_username>\` - Retrieves the details of the specified user.
        - \`rename <name> <new_leetcode_username> <new_codeforces_username>\` - Updates the username of an existing user.
        - \`!escape <username>\` - Removes the specified user from the system.
        
        **Example:**
        - \`!join mohy null mohyware\` - To only enter codeforces username.
    
        **Problem Commands:** 
         For problems that are not in codeforces or leetcode, add them manually.  
        - \`!addproblem <problemId> <title> <platform> <submissionId (optional)>\` - Adds a new problem to the system.
        - \`!deleteproblem <problemID>\` - Deletes the specified problem from the system.   
        
        **Statistics Commands(Only Admin):**
        - \`!dailystreak\` - Retrieves the daily streak statistics for all users.
        - \`!updatestreak\` - Updates the daily streak of the all users.
        - \`!setstreak <@username> <days>\` - Manually sets the daily streak for a user.
        `;
        return message.reply(helpMessage);
    }
    catch (error) {
        throw error;
    }
}
module.exports = {
    addUser,
    getUser,
    updateUser,
    deleteUser,
    updateStreak,
    setStreak,
    helpMessage
};