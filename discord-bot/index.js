const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();
const db = require('./util/database');
const { simple } = require('./src/utils/embedBuilder');
const { allPossibleHeroes } = require('../backend/game/data');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.once(Events.ClientReady, async () => {
    console.log(`✅ Logged in as ${client.user.tag}! The bot is online.`);

    // Test database connection
    try {
        const [rows, fields] = await db.execute('SELECT 1');
        console.log('✅ Database connection successful.');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    }
});


// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {
        const userId = interaction.user.id;
        const [rows] = await db.execute('SELECT * FROM users WHERE discord_id = ?', [userId]);
        if (rows.length === 0) {
            await db.execute('INSERT INTO users (discord_id, summoning_shards) VALUES (?, 0)', [userId]);
        }

        if (interaction.commandName === 'summon') {
            const SHARD_COST = 10;
            const userShards = rows[0] ? rows[0].summoning_shards : 0;
            if (userShards < SHARD_COST) {
                return interaction.reply({ content: `You don't have enough summoning shards! You need ${SHARD_COST}.`, ephemeral: true });
            }

            await db.execute('UPDATE users SET summoning_shards = summoning_shards - ? WHERE discord_id = ?', [SHARD_COST, userId]);

            const roll = Math.random();
            let rarity = 'Common';
            if (roll < 0.005) rarity = 'Epic';
            else if (roll < 0.05) rarity = 'Rare';
            else if (roll < 0.30) rarity = 'Uncommon';

            const possibleHeroes = allPossibleHeroes.filter(h => h.rarity === rarity);
            const summonedHero = possibleHeroes[Math.floor(Math.random() * possibleHeroes.length)];

            await db.execute('INSERT INTO user_champions (user_id, base_hero_id) VALUES (?, ?)', [userId, summonedHero.id]);

            const embed = simple(`✨ You Summoned a Champion! ✨`, [
                { name: summonedHero.name, value: `Rarity: ${summonedHero.rarity}\nClass: ${summonedHero.class}` }
            ]);
            await interaction.reply({ embeds: [embed] });
        } else {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
        }
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [simple('There was an error executing this command!')], ephemeral: true }).catch(() => {});
        } else {
            await interaction.reply({ embeds: [simple('There was an error executing this command!')], ephemeral: true }).catch(() => {});
        }
    }
});


client.login(process.env.DISCORD_TOKEN);
