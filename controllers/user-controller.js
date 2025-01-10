const User = require('../models/user-model');
const leetcode = require('../services/apis/leetcode');
const codeforces = require('../services/apis/codeforces');
const CustomError = require('../utils/custom-error');

const searchForUser = async (searchQuery) => {
    try {

        let user = await User.findOne({ name: searchQuery });

        if (!user) {
            user = await User.findOne({ codeforces_username: searchQuery });

            if (!user) {
                user = await User.findOne({ leetcode_username: searchQuery });
            }
        }

        if (!user) {
            return null;
        }

        return user;
    } catch (error) {
        throw error;
    }
};

const getUser = async (searchQuery) => {
    try {
        const user = await searchForUser(searchQuery);
        return user;
    } catch (error) {
        throw error;
    }
}
const addUser = async (name, leetcode_username, codeforces_username, discord_id) => {
    try {

        // Check if user already exists in database
        const nameCheck = await searchForUser(name);
        const leetcode_usernameCheck = await searchForUser(leetcode_username);
        const codeforces_usernameCheck = await searchForUser(codeforces_username);

        if (nameCheck || leetcode_usernameCheck || codeforces_usernameCheck) {
            throw new CustomError('this username already exists');
        }

        // Check if user handles exists on leetcode and codeforces
        const LC_checkUserExists = await leetcode.checkUserExists(leetcode_username);
        const CF_checkUserExists = await codeforces.checkUserExists(codeforces_username);

        if (!LC_checkUserExists || !CF_checkUserExists) {
            throw new CustomError('User does not exist on LeetCode or Codeforces');
        }

        const LC_username = leetcode_username === 'null' ? undefined : leetcode_username;
        const FC_username = codeforces_username === 'null' ? undefined : codeforces_username;

        const user = new User({
            name,
            leetcode_username: LC_username,
            codeforces_username: FC_username,
            discordId: discord_id,
            total_acSubmissions: 0,
        });

        await user.save();
        return user;
    } catch (error) {
        throw error;
    }
}

const updateUser = async (name, newLeetcodeUsername, newCodeforcesUsername) => {
    try {

        const nameCheck = await searchForUser(name);
        const leetcode_usernameCheck = await searchForUser(newLeetcodeUsername);
        const codeforces_usernameCheck = await searchForUser(newCodeforcesUsername);

        if (nameCheck || leetcode_usernameCheck || codeforces_usernameCheck) {
            throw new CustomError('this username already exists');
        }

        const user = await User.findOneAndUpdate(
            { name },
            { leetcode_username: newLeetcodeUsername, codeforces_username: newCodeforcesUsername },
            { new: true }
        );
        return user;
    }
    catch (error) {
        throw error;
    }
}

const deleteUser = async (searchQuery) => {
    try {
        const user = await searchForUser(searchQuery);
        const deletedUser = await User.findOneAndDelete({ name: user.name });
        return deletedUser;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getUser,
    addUser,
    updateUser,
    deleteUser
}