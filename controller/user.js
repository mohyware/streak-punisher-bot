const User = require('../models/user');

const searchForUser = async (searchQuery) => {
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
};

const getUser = async (searchQuery) => {
    const user = await searchForUser(searchQuery);
    return user;
}
const addUser = async (name, leetcode_username, codeforces_username, discord_id) => {
    const nameCheck = await searchForUser(name);
    const leetcode_usernameCheck = await searchForUser(leetcode_username);
    const codeforces_usernameCheck = await searchForUser(codeforces_username);

    if (nameCheck || leetcode_usernameCheck || codeforces_usernameCheck) {
        throw new Error('User already exists');
    }
    const leetcode = leetcode_username === 'null' ? undefined : leetcode_username;
    const codeforces = codeforces_username === 'null' ? undefined : codeforces_username;

    const user = new User({
        name,
        leetcode_username: leetcode,
        codeforces_username: codeforces,
        discordId: discord_id,
        total_acSubmissions: 0,
    });

    await user.save();
    console.log("user == ", user);
    return user;
}

const updateUser = async (name, newLeetcodeUsername, newCodeforcesUsername) => {
    try {

        const nameCheck = await searchForUser(name);
        const leetcode_usernameCheck = await searchForUser(newLeetcodeUsername);
        const codeforces_usernameCheck = await searchForUser(newCodeforcesUsername);

        if (nameCheck || leetcode_usernameCheck || codeforces_usernameCheck) {
            throw new Error('User already exists');
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
    const user = await searchForUser(searchQuery);
    const deletedUser = await User.findOneAndDelete({ name: user.name });
    return deletedUser;
}

module.exports = {
    getUser,
    addUser,
    updateUser,
    deleteUser
}