const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const db = require('./util/database');
const { simple } = require('./src/utils/embedBuilder');
const {
  allPossibleHeroes,
  allPossibleWeapons,
  allPossibleArmors,
  allPossibleAbilities
} = require('../backend/game/data');
const { createCombatant } = require('../backend/game/utils');
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
    // --- Slash Command Handler ---
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'team' && interaction.options.getSubcommand() === 'set-defense') {
            try {
                const userId = interaction.user.id;
                const [ownedChampions] = await db.execute(
                    'SELECT id, base_hero_id, level FROM user_champions WHERE user_id = ?',
                    [userId]
                );
                if (ownedChampions.length < 1) {
                    await interaction.reply({ content: 'You need at least one champion in your roster to set a defense team.', ephemeral: true });
                    return;
                }

                const options = ownedChampions.map(champion => {
                    const staticData = allPossibleHeroes.find(h => h.id === champion.base_hero_id);
                    const name = staticData ? staticData.name : `Unknown Hero (ID: ${champion.base_hero_id})`;
                    const rarity = staticData ? staticData.rarity : 'Unknown';
                    const heroClass = staticData ? staticData.class : 'Unknown';
                    return {
                        label: `${name} (Lvl ${champion.level})`,
                        description: `${rarity} ${heroClass}`,
                        value: champion.id.toString(),
                    };
                });

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('defense_team_select')
                    .setPlaceholder('Select your defense team (1 Monster OR 2 Champions)')
                    .setMinValues(1)
                    .setMaxValues(2)
                    .addOptions(options);
                const row = new ActionRowBuilder().addComponents(selectMenu);
                await interaction.reply({ content: 'Choose your defense team!', components: [row], ephemeral: true });
            } catch (error) {
                console.error('Error preparing defense team selection:', error);
                if (!interaction.replied) {
                    await interaction.reply({ content: 'An error occurred while preparing your defense team.', ephemeral: true });
                }
            }
            return;
        }
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`, error);
            const replyOptions = { content: 'There was an error executing this command!', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(replyOptions);
            } else {
                await interaction.reply(replyOptions);
            }
        }
        return;
    }

    // --- Button Interaction Handler ---
    if (interaction.isButton()) {
        try {
            switch (interaction.customId) {
                case 'town_summon': {
                    const summonRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('town_summon_champion').setLabel('Summon Champion (10 Shards)').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('town_unleash_monster').setLabel('Unleash Monster (1 Lodestone)').setStyle(ButtonStyle.Danger)
                    );
                    await interaction.reply({ content: 'Choose your summoning method:', components: [summonRow], ephemeral: true });
                    break;
                }
                case 'town_summon_champion': {
                    const userId = interaction.user.id;
                    const SHARD_COST = 10;
                    const [userRows] = await db.execute('SELECT summoning_shards FROM users WHERE discord_id = ?', [userId]);
                    if (userRows.length === 0 || userRows[0].summoning_shards < SHARD_COST) {
                        await interaction.reply({ content: `You don't have enough summoning shards! You need ${SHARD_COST}.`, ephemeral: true });
                        break;
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

                    const embed = simple('✨ You Summoned a Champion! ✨', [
                        { name: summonedHero.name, value: `Rarity: ${summonedHero.rarity}\nClass: ${summonedHero.class}` }
                    ]);
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    break;
                }
                case 'town_unleash_monster': {
                    const userId = interaction.user.id;
                    const LODESTONE_COST = 1;
                    const userHasStones = true;
                    if (!userHasStones) {
                        await interaction.reply({ content: 'You do not have a Corrupted Lodestone to unleash a monster.', ephemeral: true });
                        break;
                    }

                    const monsters = allPossibleHeroes.filter(h => h.isMonster);
                    const summonedMonster = monsters[Math.floor(Math.random() * monsters.length)];

                    await db.execute('INSERT INTO user_champions (user_id, base_hero_id) VALUES (?, ?)', [userId, summonedMonster.id]);

                    const embed = simple('🔥 A Monster Emerges! 🔥', [
                        { name: summonedMonster.name, value: `Rarity: ${summonedMonster.rarity}\nTrait: ${summonedMonster.trait}` }
                    ]);
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    break;
                }
                case 'town_barracks': {
                    await interaction.deferReply({ ephemeral: true });

                    const userId = interaction.user.id;

                    const [userRows] = await db.execute('SELECT soft_currency, hard_currency, summoning_shards, corrupted_lodestones FROM users WHERE discord_id = ?', [userId]);
                    const user = userRows[0] || {};

                    const [roster] = await db.execute(
                        `SELECT h.name, h.rarity, h.class, uc.level 
                         FROM user_champions uc 
                         JOIN heroes h ON uc.base_hero_id = h.id 
                         WHERE uc.user_id = ? ORDER BY h.rarity DESC, uc.level DESC LIMIT 25`,
                        [userId]
                    );

                    const embed = new EmbedBuilder()
                        .setColor('#78716c')
                        .setTitle(`${interaction.user.username}'s Barracks`)
                        .addFields(
                            { name: 'Gold', value: `🪙 ${user.soft_currency || 0}`, inline: true },
                            { name: 'Gems', value: `💎 ${user.hard_currency || 0}`, inline: true },
                            { name: 'Summoning Shards', value: `✨ ${user.summoning_shards || 0}`, inline: true }
                        );

                    if (roster.length > 0) {
                        const rosterString = roster.map(c => `**${c.name}** (Lvl ${c.level}) - *${c.rarity} ${c.class}*`).join('\n');
                        embed.addFields({ name: 'Champion Roster', value: rosterString });
                    } else {
                        embed.addFields({ name: 'Champion Roster', value: 'Your roster is empty. Visit the Summoning Circle!' });
                    }

                    await interaction.editReply({ embeds: [embed] });
                    break;
                }
                case 'town_dungeon': {
                    const userId = interaction.user.id;
                    const [ownedChampions] = await db.execute(
                        'SELECT id, base_hero_id, level FROM user_champions WHERE user_id = ?',
                        [userId]
                    );
                    if (ownedChampions.length < 2) {
                        await interaction.reply({ content: 'You need at least 2 champions in your roster to fight! Use `/summon` to recruit more.', ephemeral: true });
                        break;
                    }
                    const options = ownedChampions.map(champion => {
                        const staticData = allPossibleHeroes.find(h => h.id === champion.base_hero_id);
                        const name = staticData ? staticData.name : `Unknown Hero (ID: ${champion.base_hero_id})`;
                        const rarity = staticData ? staticData.rarity : 'Unknown';
                        const heroClass = staticData ? staticData.class : 'Unknown';
                        return {
                            label: `${name} (Lvl ${champion.level})`,
                            description: `${rarity} ${heroClass}`,
                            value: champion.id.toString(),
                        };
                    });
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('fight_team_select')
                        .setPlaceholder('Select your team (1 Monster OR 2 Champions)')
                        .setMinValues(1)
                        .setMaxValues(2)
                        .addOptions(options);
                    const row = new ActionRowBuilder().addComponents(selectMenu);
                    await interaction.reply({ content: 'Choose your team for the dungeon fight!', components: [row], ephemeral: true });
                    break;
                }
                case 'town_craft':
                case 'town_market':
                    await interaction.reply({ content: 'This feature is coming soon!', ephemeral: true });
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error('Error handling button interaction:', err);
            if (!interaction.replied) {
                await interaction.reply({ content: 'An error occurred while processing this interaction.', ephemeral: true });
            }
        }
        return;
    }

    // --- Selection Menu Handler ---
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'fight_team_select') {
            try {
                const selections = interaction.values;

                // Check for monster selection
                const monsterSelectionId = selections.find(id => {
                    const champ = allPossibleHeroes.find(h => h.id === parseInt(id));
                    return champ && champ.isMonster;
                });

                let playerChampion1_db, playerChampion2_db;

                if (monsterSelectionId) {
                    if (selections.length > 1) {
                        return interaction.update({ content: 'You cannot select a monster and another champion. A monster takes up the whole team.', components: [] });
                    }
                    const [rows] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [monsterSelectionId]);
                    playerChampion1_db = rows[0];
                    playerChampion2_db = null;
                    await interaction.update({ content: `You have chosen the monster: ${allPossibleHeroes.find(h => h.id === playerChampion1_db.base_hero_id).name}! Preparing the battle...`, components: [] });
                } else {
                    await interaction.update({ content: 'Team selected! Preparing the battle...', components: [] });

                    const [player_champion_id_1, player_champion_id_2] = selections;
                    const [p1_rows] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [player_champion_id_1]);
                    const [p2_rows] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [player_champion_id_2]);
                    playerChampion1_db = p1_rows[0];
                    playerChampion2_db = p2_rows[0];
                }

                const aiChampion1 = generateRandomChampion();
                let aiChampion2 = generateRandomChampion();
                while (aiChampion2.id === aiChampion1.id) {
                    aiChampion2 = generateRandomChampion();
                }

                const combatants = [
                    createCombatant({ hero_id: playerChampion1_db.base_hero_id, weapon_id: playerChampion1_db.equipped_weapon_id, armor_id: playerChampion1_db.equipped_armor_id, ability_id: playerChampion1_db.equipped_ability_id }, 'player', 0),
                    playerChampion2_db ? createCombatant({ hero_id: playerChampion2_db.base_hero_id, weapon_id: playerChampion2_db.equipped_weapon_id, armor_id: playerChampion2_db.equipped_armor_id, ability_id: playerChampion2_db.equipped_ability_id }, 'player', 1) : null,
                    createCombatant({ hero_id: aiChampion1.id, weapon_id: aiChampion1.weapon, armor_id: aiChampion1.armor, ability_id: aiChampion1.ability }, 'enemy', 0),
                    createCombatant({ hero_id: aiChampion2.id, weapon_id: aiChampion2.weapon, armor_id: aiChampion2.armor, ability_id: aiChampion2.ability }, 'enemy', 1)
                ].filter(Boolean);

                if (combatants.length < 3) {
                    throw new Error('Failed to create all combatants for the battle. Check if all hero IDs are valid.');
                }

                const gameInstance = new GameEngine(combatants);
                const battleLog = gameInstance.runFullGame();
                const winner = gameInstance.winner === 'player' ? interaction.user.username : 'AI Opponent';

                await interaction.followUp({ embeds: [simple(`⚔️ Battle Complete! ⚔️`, [{ name: 'Winner', value: winner }])], ephemeral: true });

                const logChunks = chunkBattleLog(battleLog);
                for (const chunk of logChunks) {
                    await interaction.followUp({ content: `\`\`\`${chunk}\`\`\``, ephemeral: true });
                }

            } catch (error) {
                console.error('Error handling fight selection:', error);
                await interaction.followUp({ content: 'An error occurred while starting the battle.', ephemeral: true }).catch(() => {});
            }
        } else if (interaction.customId === 'defense_team_select') {
            try {
                const selections = interaction.values;

                const monsterSelectionId = selections.find(id => {
                    const champ = allPossibleHeroes.find(h => h.id === parseInt(id));
                    return champ && champ.isMonster;
                });

                let champion1Id, champion2Id = null;

                if (monsterSelectionId) {
                    if (selections.length > 1) {
                        return interaction.update({ content: 'You cannot select a monster and another champion. A monster takes up the whole team.', components: [] });
                    }
                    champion1Id = monsterSelectionId;
                    champion2Id = null;
                } else {
                    [champion1Id, champion2Id] = selections;
                }

                await db.execute(
                    `INSERT INTO defense_teams (user_id, champion_1_id, champion_2_id)
                     VALUES (?, ?, ?)
                     ON DUPLICATE KEY UPDATE champion_1_id = VALUES(champion_1_id), champion_2_id = VALUES(champion_2_id)`,
                    [interaction.user.id, champion1Id, champion2Id || null]
                );

                await interaction.update({ content: 'Your defense team has been set!', components: [] });
            } catch (error) {
                console.error('Error setting defense team:', error);
                await interaction.update({ content: 'An error occurred while setting your defense team.', components: [] });
            }
        }
        return;
    }
});


function generateRandomChampion() {
    const commonHeroes = allPossibleHeroes.filter(h => h.rarity === 'Common');
    const hero = commonHeroes[Math.floor(Math.random() * commonHeroes.length)];
    const abilityPool = allPossibleAbilities.filter(a => a.class === hero.class && a.rarity === 'Common');
    const ability = abilityPool.length > 0 ? abilityPool[Math.floor(Math.random() * abilityPool.length)] : null;
    const weapon = allPossibleWeapons[Math.floor(Math.random() * allPossibleWeapons.length)];
    const armor = allPossibleArmors[Math.floor(Math.random() * allPossibleArmors.length)];
    return { id: hero.id, ability: ability?.id, weapon: weapon.id, armor: armor.id };
}

function chunkBattleLog(log, chunkSize = 1980) {
    const chunks = [];
    let currentChunk = "";
    for (const line of log) {
        if (currentChunk.length + line.length + 1 > chunkSize) {
            chunks.push(currentChunk);
            currentChunk = "";
        }
        currentChunk += line + "\n";
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    return chunks;
}


client.login(process.env.DISCORD_TOKEN);
