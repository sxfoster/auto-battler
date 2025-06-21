// index.js

// 1. Require the necessary discord.js classes and the dotenv library
const { Client, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config(); // This loads the .env file variables

// 2. Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 3. Create a "ready" event listener
client.once(Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user.tag}! The bot is online.`);
});

// NEW: Add an interactionCreate event listener
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

// 4. Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
