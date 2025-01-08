require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const connectToDatabase = require('./services/database/connection');
const { addUser, getUser, updateUser, deleteUser } = require('./commands/user-commands');
const { addProblem, deleteProblem } = require('./commands/problem-commands');
const mongoose = require('mongoose');

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
        else if (command === 'addproblem') {
            await addProblem(args, message);
        }
        else if (command === 'deleteproblem') {
            await deleteProblem(args, message);
        }
    } catch (error) {
        console.error(error);

        if (error.message === 'User already exists') {
            return message.reply('❌ The user already exists with that name.');
        }
        else if (error.message === 'User not found') {
            return message.reply('❌ The user was not found.');
        }

        else if (error.message === 'Problem already exists') {
            return message.reply('❌ The problem already exists with that ID.');
        }
        else if (error.message === 'Problem not found') {
            return message.reply('❌ The problem was not found.');
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
