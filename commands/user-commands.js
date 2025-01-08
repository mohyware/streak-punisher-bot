const UserController = require('../controller/user');
const formatter = require('../utils/user-formatter');

const addUser = async (args, message) => {
    try {
        const [name, leetcode_username, codeforces_username] = args;

        if (!name || (!leetcode_username && !codeforces_username) ||
            (leetcode_username === 'null' && codeforces_username === 'null')) {
            return message.reply(
                '❗ **Usage:** `!adduser <name> <leetcode_username (optional)> <codeforces_username (optional)>`\n' +
                'ℹ️ If you don\'t have a username for one of the platforms, enter `null`.\n' +
                '💡 **Example:** `!adduser mohy null mohyware`'
            );
        }

        await UserController.addUser(name, leetcode_username, codeforces_username);
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
            return message.reply(`❌ **No user found** with search query: \`${searchQuery}\` 🔍`);
        }

        const data = await formatter(user);
        message.reply(`📄 **User Information:**\n${data}`);
    } catch (error) {
        throw error;
    }
};

const updateUser = async (args, message) => {
    try {
        const [name, newLeetcodeUsername, newCodeforcesUsername] = args;

        if (!name || !newLeetcodeUsername || !newCodeforcesUsername) {
            return message.reply(
                '❗ **Usage:** `!updateuser <name> <new_leetcode_username> <new_codeforces_username>`'
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

module.exports = {
    addUser,
    getUser,
    updateUser,
    deleteUser
};