require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const connectToDatabase = require('./services/database/connection');
const { addUser, getUser, updateUser, deleteUser, updateStreak, setStreak, helpMessage } = require('./commands/user-commands');
const { addProblem, getAllUserStatistics, deleteProblem } = require('./commands/problem-commands');
const mongoose = require('mongoose');
const CustomError = require('./utils/custom-error');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Bot ready event
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await connectToDatabase();
});

// Command handler
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!')) return; // Prefix for bot commands
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        // Check if the message is in the allowed channel
        if (message.channel.id !== process.env.ALLOWED_CHANNEL_ID) {
            return;
        }
        if (command === 'help') {
            await helpMessage(message);
        }
        // user commands
        if (command === 'join') {
            await addUser(args, message);
        } else if (command === 'getuser') {
            await getUser(args, message);
        } else if (command === 'rename') {
            await updateUser(args, message);
        }
        else if (command === 'escape') {
            await deleteUser(args, message);
        }
        // problem commands
        else if (command === 'addproblem') {
            await addProblem(args, message);
        }
        else if (command === 'deleteproblem') {
            await deleteProblem(args, message);
        }
        // statistics commands
        else if (command === 'dailystreak') {
            await getAllUserStatistics(args, message);
        }
        else if (command === 'updatestreak') {
            await updateStreak(args, message);
        }
        else if (command === 'setstreak') {
            await setStreak(args, message);
        }
    } catch (error) {
        if (error instanceof CustomError) {
            return message.reply(error.message);
        }

        else if (error instanceof mongoose.Error) {
            message.reply('❌ An error occurred while interacting with the database.');
        }

        else {
            message.reply('❌ An error occurred while processing your request.');
        }
    }
});

// Login to Discord
client.login(process.env.BOT_TOKEN);
