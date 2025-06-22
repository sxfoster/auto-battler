const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
require('dotenv').config();
const db = require('./util/database');
const { simple } = require('./src/utils/embedBuilder');
const { allPossibleHeroes } = require('../backend/game/data');
const { createCombatant, generateRandomChampion } = require('../backend/game/utils');
const GameEngine = require('../backend/game/engine');

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
    try {
        if (interaction.isChatInputCommand()) {
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
            } else if (interaction.commandName === 'fight') {
                const [roster] = await db.execute(
                    'SELECT uc.id, uc.level, h.name, h.rarity FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.user_id = ?',
                    [userId]
                );

                if (roster.length < 2) {
                    return interaction.reply({ content: 'You need at least 2 champions in your roster to fight! Use `/summon` to recruit more.', ephemeral: true });
                }

                const options = roster.map(champion => ({
                    label: `${champion.name} (Lvl ${champion.level})`,
                    description: `Rarity: ${champion.rarity}`,
                    value: champion.id.toString(),
                }));

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('fight_team_select')
                    .setPlaceholder('Select 2 champions for your team')
                    .setMinValues(2)
                    .setMaxValues(2)
                    .addOptions(options);

                const row = new ActionRowBuilder().addComponents(selectMenu);

                await interaction.reply({
                    content: 'Choose your team for the dungeon fight!',
                    components: [row],
                    ephemeral: true,
                });
                return;
            } else {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;
                await command.execute(interaction);
            }
        } else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'fight_team_select') {
                await interaction.update({ content: 'Team selected! Preparing the battle...', components: [] });

                const [champion1_id, champion2_id] = interaction.values;

                const [p1_rows] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [champion1_id]);
                const [p2_rows] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [champion2_id]);
                const playerChampion1 = p1_rows[0];
                const playerChampion2 = p2_rows[0];

                const aiChampion1 = generateRandomChampion();
                const aiChampion2 = generateRandomChampion();

                const combatants = [
                    createCombatant({ hero_id: playerChampion1.base_hero_id, weapon_id: playerChampion1.weapon_id, armor_id: playerChampion1.armor_id, ability_id: playerChampion1.ability_id }, 'player', 0),
                    createCombatant({ hero_id: playerChampion2.base_hero_id, weapon_id: playerChampion2.weapon_id, armor_id: playerChampion2.armor_id, ability_id: playerChampion2.ability_id }, 'player', 1),
                    createCombatant({ hero_id: aiChampion1.hero_id, weapon_id: aiChampion1.weapon_id, armor_id: aiChampion1.armor_id, ability_id: aiChampion1.ability_id }, 'enemy', 0),
                    createCombatant({ hero_id: aiChampion2.hero_id, weapon_id: aiChampion2.weapon_id, armor_id: aiChampion2.armor_id, ability_id: aiChampion2.ability_id }, 'enemy', 1)
                ];

                const gameInstance = new GameEngine(combatants);
                const battleLog = gameInstance.runFullGame();
                const winner = gameInstance.winner;

                await interaction.followUp({ embeds: [simple(`Battle Complete! Winner: ${winner}`)], ephemeral: true });
                for (const line of battleLog) {
                    await interaction.followUp({ content: line, ephemeral: true });
                }
            }
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
