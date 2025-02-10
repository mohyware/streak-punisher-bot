require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const connectToDatabase = require('./services/database/connection');
const { addUser, getUser, updateUser, deleteUser, updateStreak, setStreak, helpMessage } = require('./commands/user-commands');
const { addProblem, addProblems, getAllUserStatistics, setOtherProblemsCount, deleteProblem } = require('./commands/problem-commands');
const mongoose = require('mongoose');
const CustomError = require('./utils/custom-error');
const cron = require('node-cron');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Bot ready event
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await connectToDatabase();

    // Schedule dailystreak to run every day at 11:50 PM
    cron.schedule('50 23 * * *', async () => {
        const channel = client.channels.cache.get(process.env.ALLOWED_CHANNEL_ID_1);
        if (channel) {
            // Create a mock `message` object
            const fakeMessage = {
                author: { id: process.env.OWNER_ID },
                reply: async (text) => await channel.send(text),
            };
            try {
                await updateStreak({}, fakeMessage);
                await getAllUserStatistics({}, fakeMessage);
            } catch (error) {
                channel.send("حاجة احا خالص حصلت بوظته هبقي اصلحها لما اصحي");
            }
        }
    }, {
        timezone: 'Africa/Cairo'
    });
});

// Command handler
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!')) return; // Prefix for bot commands
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        const allowedChannelIds = [
            process.env.ALLOWED_CHANNEL_ID_1,
            process.env.ALLOWED_CHANNEL_ID_2,
            process.env.ALLOWED_CHANNEL_ID_3,
        ];

        if (!allowedChannelIds.includes(message.channel.id)) {
            return; // Exit if the channel is not allowed
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
        else if (command === 'addproblems') {
            await addProblems(args, message);
        }
        else if (command === 'deleteproblem') {
            await deleteProblem(args, message);
        }
        else if (command === 'setcount') {
            await setOtherProblemsCount(args, message);
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


// For health check from Koyeb deployment
const http = require("http");

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is running!");
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Health check server running on port ${PORT}`);
});
