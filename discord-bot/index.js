const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const db = require('./util/database');
const { simple } = require('./src/utils/embedBuilder');
const {
  allPossibleWeapons,
  allPossibleArmors,
  allPossibleAbilities
} = require('../backend/game/data');
const { loadAllData, gameData, getHeroes, getHeroById, getMonsters } = require('./util/gameData');
const { createCombatant } = require('../backend/game/utils');
const GameEngine = require('../backend/game/engine');
const { getTownMenu } = require('./commands/town.js');


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
        await loadAllData();
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    }
});


// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
    // --- Autocomplete Handler ---
    if (interaction.isAutocomplete()) {
        if (interaction.commandName === 'team' && interaction.options.getSubcommand() === 'manage') {
            const focused = interaction.options.getFocused(true);
            if (focused.name === 'champion') {
                try {
                    const userId = interaction.user.id;
                    const [rows] = await db.execute(
                        `SELECT uc.id, h.name FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.user_id = ?`,
                        [userId]
                    );
                    const filtered = rows
                        .filter(r => r.name.toLowerCase().includes(focused.value.toLowerCase()))
                        .slice(0, 25)
                        .map(r => ({ name: r.name, value: r.id.toString() }));
                    await interaction.respond(filtered);
                } catch (err) {
                    console.error('Autocomplete error:', err);
                }
            }
        }
        if (interaction.commandName === 'market' && interaction.options.getSubcommand() === 'list') {
            const focused = interaction.options.getFocused(true);
            if (focused.name === 'item') {
                try {
                    const userId = interaction.user.id;
                    const [rows] = await db.execute(
                        `SELECT i.id, i.name FROM user_inventory ui JOIN items i ON ui.item_id = i.id WHERE ui.user_id = ?`,
                        [userId]
                    );
                    const filtered = rows
                        .filter(r => r.name.toLowerCase().includes(focused.value.toLowerCase()))
                        .slice(0, 25)
                        .map(r => ({ name: r.name, value: r.id.toString() }));
                    await interaction.respond(filtered);
                } catch (err) {
                    console.error('Autocomplete error:', err);
                }
            }
        }
        return;
    }
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
                    const staticData = getHeroById(champion.base_hero_id);
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
        if (interaction.commandName === 'team' && interaction.options.getSubcommand() === 'manage') {
            try {
                const userId = interaction.user.id;
                const championId = interaction.options.getString('champion');
                const [rows] = await db.execute(
                    `SELECT uc.*, h.name FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.id = ? AND uc.user_id = ?`,
                    [championId, userId]
                );
                if (rows.length === 0) {
                    await interaction.reply({ content: 'Champion not found.', ephemeral: true });
                    return;
                }
                const champ = rows[0];

                const [invRows] = await db.execute('SELECT item_id FROM user_inventory WHERE user_id = ?', [userId]);
                const weapons = [];
                const armors = [];
                const abilities = [];
                for (const inv of invRows) {
                    const wid = parseInt(inv.item_id);
                    const w = allPossibleWeapons.find(x => x.id === wid);
                    if (w) weapons.push({ label: w.name, value: String(w.id) });
                    const a = allPossibleArmors.find(x => x.id === wid);
                    if (a) armors.push({ label: a.name, value: String(a.id) });
                    const ab = allPossibleAbilities.find(x => x.id === wid);
                    if (ab) abilities.push({ label: ab.name, value: String(ab.id) });
                }

                const embed = new EmbedBuilder()
                    .setColor('#29b6f6')
                    .setTitle(champ.name)
                    .addFields(
                        { name: 'Level', value: String(champ.level), inline: true },
                        { name: 'XP', value: String(champ.xp || 0), inline: true },
                        { name: 'Weapon', value: champ.equipped_weapon_id ? (allPossibleWeapons.find(w => w.id === champ.equipped_weapon_id)?.name || `ID ${champ.equipped_weapon_id}`) : 'None', inline: true },
                        { name: 'Armor', value: champ.equipped_armor_id ? (allPossibleArmors.find(a => a.id === champ.equipped_armor_id)?.name || `ID ${champ.equipped_armor_id}`) : 'None', inline: true },
                        { name: 'Ability', value: champ.equipped_ability_id ? (allPossibleAbilities.find(ab => ab.id === champ.equipped_ability_id)?.name || `ID ${champ.equipped_ability_id}`) : 'None', inline: true }
                    );

                const components = [];
                if (weapons.length) {
                    const menu = new StringSelectMenuBuilder()
                        .setCustomId(`equip_weapon_${champ.id}`)
                        .setPlaceholder('Select Weapon')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(weapons);
                    components.push(new ActionRowBuilder().addComponents(menu));
                }
                if (armors.length) {
                    const menu = new StringSelectMenuBuilder()
                        .setCustomId(`equip_armor_${champ.id}`)
                        .setPlaceholder('Select Armor')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(armors);
                    components.push(new ActionRowBuilder().addComponents(menu));
                }
                if (abilities.length) {
                    const menu = new StringSelectMenuBuilder()
                        .setCustomId(`equip_ability_${champ.id}`)
                        .setPlaceholder('Select Ability')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(abilities);
                    components.push(new ActionRowBuilder().addComponents(menu));
                }
                await interaction.reply({ embeds: [embed], components, ephemeral: true });
            } catch (err) {
                console.error('Error preparing champion management:', err);
                if (!interaction.replied) {
                    await interaction.reply({ content: 'An error occurred while preparing this menu.', ephemeral: true });
                }
            }
            return;
        }
        if (interaction.commandName === 'market') {
            try {
                const sub = interaction.options.getSubcommand();
                if (sub === 'list') {
                    const userId = interaction.user.id;
                    const itemId = interaction.options.getString('item');
                    const price = interaction.options.getInteger('price');

                    const [[inv]] = await db.execute(
                        'SELECT quantity FROM user_inventory WHERE user_id = ? AND item_id = ?',
                        [userId, itemId]
                    );
                    if (!inv || inv.quantity < 1) {
                        await interaction.reply({ content: 'You do not own that item.', ephemeral: true });
                        return;
                    }

                    await db.execute(
                        'UPDATE user_inventory SET quantity = quantity - 1 WHERE user_id = ? AND item_id = ?',
                        [userId, itemId]
                    );
                    await db.execute(
                        'DELETE FROM user_inventory WHERE user_id = ? AND item_id = ? AND quantity <= 0',
                        [userId, itemId]
                    );
                    const [res] = await db.execute(
                        'INSERT INTO market_listings (seller_id, item_id, price) VALUES (?, ?, ?)',
                        [userId, itemId, price]
                    );
                    await interaction.reply({ content: `Listing created with ID ${res.insertId}.`, ephemeral: true });
                } else if (sub === 'buy') {
                    const listingId = interaction.options.getInteger('listing_id');
                    const [[listing]] = await db.execute(
                        'SELECT ml.*, i.name FROM market_listings ml JOIN items i ON ml.item_id = i.id WHERE ml.id = ?',
                        [listingId]
                    );
                    if (!listing) {
                        await interaction.reply({ content: 'Listing not found.', ephemeral: true });
                        return;
                    }
                    const buyerId = interaction.user.id;
                    const [[buyer]] = await db.execute(
                        'SELECT soft_currency FROM users WHERE discord_id = ?',
                        [buyerId]
                    );
                    if (!buyer || buyer.soft_currency < listing.price) {
                        await interaction.reply({ content: 'You do not have enough gold.', ephemeral: true });
                        return;
                    }

                    await db.execute(
                        'UPDATE users SET soft_currency = soft_currency - ? WHERE discord_id = ?',
                        [listing.price, buyerId]
                    );
                    await db.execute(
                        'UPDATE users SET soft_currency = soft_currency + ? WHERE discord_id = ?',
                        [listing.price, listing.seller_id]
                    );
                    await db.execute(
                        'INSERT INTO user_inventory (user_id, item_id, quantity) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1',
                        [buyerId, listing.item_id]
                    );
                    await db.execute('DELETE FROM market_listings WHERE id = ?', [listingId]);
                    await interaction.reply({ content: `You bought ${listing.name} for ${listing.price} gold.`, ephemeral: true });
                }
            } catch (error) {
                console.error('Error processing market command:', error);
                if (!interaction.replied) {
                    await interaction.reply({ content: 'An error occurred while processing this market command.', ephemeral: true });
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
                    const summonEmbed = simple('The Summoning Circle', [
                        { name: 'Choose Your Method', value: 'Use Shards to recruit champions or a Lodestone to unleash a monster.' }
                    ]);
                    const summonRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('summon_champion').setLabel('Summon Champion (10 Shards)').setStyle(ButtonStyle.Success).setEmoji('✨'),
                            new ButtonBuilder().setCustomId('unleash_monster').setLabel('Unleash Monster (1 Lodestone)').setStyle(ButtonStyle.Danger).setEmoji('🔥')
                        );
                    await interaction.reply({ embeds: [summonEmbed], components: [summonRow], ephemeral: true });
                    break;
                }
                case 'summon_champion': {
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

                    const possibleHeroes = getHeroes().filter(h => h.rarity === rarity && !h.is_monster);
                    const summonedHero = possibleHeroes[Math.floor(Math.random() * possibleHeroes.length)];

                    await db.execute('INSERT INTO user_champions (user_id, base_hero_id) VALUES (?, ?)', [userId, summonedHero.id]);

                    const embed = simple('✨ You Summoned a Champion! ✨', [
                        { name: summonedHero.name, value: `Rarity: ${summonedHero.rarity}\nClass: ${summonedHero.class}` }
                    ]);
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                    break;
                }
                case 'unleash_monster': {
                    const userId = interaction.user.id;
                    const LODESTONE_COST = 1;
                    const [userRows] = await db.execute('SELECT corrupted_lodestones FROM users WHERE discord_id = ?', [userId]);
                    if (userRows.length === 0 || userRows[0].corrupted_lodestones < LODESTONE_COST) {
                        await interaction.reply({ content: 'You do not have a Corrupted Lodestone to unleash a monster.', ephemeral: true });
                        break;
                    }

                    await db.execute('UPDATE users SET corrupted_lodestones = corrupted_lodestones - ? WHERE discord_id = ?', [LODESTONE_COST, userId]);

                    const monsters = getMonsters();
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

                    const navigationRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('⬅️'),
                            new ButtonBuilder().setCustomId('manage_champions').setLabel('Manage Champions').setStyle(ButtonStyle.Primary).setEmoji('⚙️')
                        );

                    await interaction.editReply({ embeds: [embed], components: [navigationRow] });
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
                        const staticData = getHeroById(champion.base_hero_id);
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
                case 'town_forge': {
                    await interaction.reply({ content: "The Forge is not yet open. Check back later!", ephemeral: true });
                    break;
                }
                case 'town_craft':
                    await interaction.reply({ content: 'This feature is coming soon!', ephemeral: true });
                    break;
                case 'town_market': {
                    await interaction.reply({ content: "The Marketplace is currently under construction.", ephemeral: true });
                    break;
                }
                case 'back_to_town': {
                    await interaction.update(getTownMenu());
                    break;
                }
                case 'manage_champions': {
                    await interaction.reply({ content: 'Champion management is coming soon!', ephemeral: true });
                    break;
                }
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
                    const champ = getHeroById(parseInt(id));
                    return champ && champ.is_monster;
                });

                let playerChampion1_db, playerChampion2_db;

                if (monsterSelectionId) {
                    if (selections.length > 1) {
                        return interaction.update({ content: 'You cannot select a monster and another champion. A monster takes up the whole team.', components: [] });
                    }
                    const [rows] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [monsterSelectionId]);
                    playerChampion1_db = rows[0];
                    playerChampion2_db = null;
                    const monsterName = getHeroById(playerChampion1_db.base_hero_id)?.name || 'Unknown Monster';
                    await interaction.update({ content: `You have chosen the monster: ${monsterName}! Preparing the battle...`, components: [] });
                } else {
                    await interaction.update({ content: 'Team selected! Preparing the battle...', components: [] });

                    const [player_champion_id_1, player_champion_id_2] = selections;
                    const [p1_rows] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [player_champion_id_1]);
                    const [p2_rows] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [player_champion_id_2]);
                    playerChampion1_db = p1_rows[0];
                    playerChampion2_db = p2_rows[0];
                }

                let isPvP = Math.random() < 0.25;
                let opponentName = 'Dungeon Monsters';
                const combatants = [
                    createCombatant({ hero_id: playerChampion1_db.base_hero_id, weapon_id: playerChampion1_db.equipped_weapon_id, armor_id: playerChampion1_db.equipped_armor_id, ability_id: playerChampion1_db.equipped_ability_id }, 'player', 0),
                    playerChampion2_db ? createCombatant({ hero_id: playerChampion2_db.base_hero_id, weapon_id: playerChampion2_db.equipped_weapon_id, armor_id: playerChampion2_db.equipped_armor_id, ability_id: playerChampion2_db.equipped_ability_id }, 'player', 1) : null,
                ];

                if (isPvP) {
                    const [opponentRows] = await db.execute(
                        'SELECT user_id FROM defense_teams WHERE user_id != ? ORDER BY RAND() LIMIT 1',
                        [interaction.user.id]
                    );
                    if (opponentRows.length > 0) {
                        const opponentId = opponentRows[0].user_id;
                        const [[defTeam]] = await db.execute(
                            'SELECT champion_1_id, champion_2_id FROM defense_teams WHERE user_id = ?',
                            [opponentId]
                        );
                        const [e1] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [defTeam.champion_1_id]);
                        const enemy1_db = e1[0];
                        let enemy2_db = null;
                        if (defTeam.champion_2_id) {
                            const [e2] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [defTeam.champion_2_id]);
                            enemy2_db = e2[0];
                        }

                        const userObj = await client.users.fetch(opponentId).catch(() => null);
                        if (userObj) opponentName = userObj.username;

                        combatants.push(
                            createCombatant({ hero_id: enemy1_db.base_hero_id, weapon_id: enemy1_db.equipped_weapon_id, armor_id: enemy1_db.equipped_armor_id, ability_id: enemy1_db.equipped_ability_id }, 'enemy', 0)
                        );
                        if (enemy2_db) {
                            combatants.push(
                                createCombatant({ hero_id: enemy2_db.base_hero_id, weapon_id: enemy2_db.equipped_weapon_id, armor_id: enemy2_db.equipped_armor_id, ability_id: enemy2_db.equipped_ability_id }, 'enemy', 1)
                            );
                        }
                    } else {
                        isPvP = false;
                    }
                }

                if (!isPvP) {
                    const [monsterRows] = await db.execute(
                        'SELECT id FROM heroes WHERE isMonster = TRUE'
                    );
                    const monsterIds = monsterRows.map(r => r.id);
                    const randIndex1 = Math.floor(Math.random() * monsterIds.length);
                    let randIndex2 = Math.floor(Math.random() * monsterIds.length);
                    while (randIndex2 === randIndex1 && monsterIds.length > 1) {
                        randIndex2 = Math.floor(Math.random() * monsterIds.length);
                    }
                    const monsterId1 = monsterIds[randIndex1];
                    const monsterId2 = monsterIds[randIndex2];
                    combatants.push(
                        createCombatant({ hero_id: monsterId1, weapon_id: null, armor_id: null, ability_id: null }, 'enemy', 0),
                        createCombatant({ hero_id: monsterId2, weapon_id: null, armor_id: null, ability_id: null }, 'enemy', 1)
                    );
                }

                const finalCombatants = combatants.filter(Boolean);

                if (finalCombatants.length < 3) {
                    throw new Error('Failed to create all combatants for the battle. Check if all hero IDs are valid.');
                }
                const gameInstance = new GameEngine(finalCombatants);
                const battleLog = gameInstance.runFullGame();
                const playerWon = gameInstance.winner === 'player';

                const resultFields = [{ name: 'Winner', value: playerWon ? interaction.user.username : opponentName }];

                if (isPvP) {
                    const ratingChange = playerWon ? 10 : -10;
                    await db.execute('UPDATE users SET pvp_rating = pvp_rating + ? WHERE discord_id = ?', [ratingChange, interaction.user.id]);
                    resultFields.push({ name: 'Rating Change', value: `${ratingChange > 0 ? '+' : ''}${ratingChange}` });
                } else if (playerWon) {
                    const xpGain = 25;
                    const survivors = finalCombatants.filter(c => c.team === 'player' && c.currentHp > 0);
                    for (const survivor of survivors) {
                        const champDb = survivor.position === 0 ? playerChampion1_db : playerChampion2_db;
                        if (champDb) {
                            await db.execute('UPDATE user_champions SET xp = xp + ? WHERE id = ?', [xpGain, champDb.id]);
                        }
                    }
                    const gold = Math.floor(Math.random() * 51) + 50;
                    await db.execute('UPDATE users SET soft_currency = soft_currency + ? WHERE discord_id = ?', [gold, interaction.user.id]);
                    resultFields.push({ name: 'Rewards', value: `${xpGain} XP to surviving champions\n${gold} Gold` });
                } else {
                    resultFields.push({ name: 'Defeat', value: 'You were vanquished by the dungeon foes.' });
                }

                await interaction.followUp({ embeds: [simple('⚔️ Battle Complete! ⚔️', resultFields)], ephemeral: true });

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
                    const champ = getHeroById(parseInt(id));
                    return champ && champ.is_monster;
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
        } else if (interaction.customId.startsWith('equip_weapon_')) {
            try {
                const championId = interaction.customId.replace('equip_weapon_', '');
                const itemId = interaction.values[0];
                await db.execute('UPDATE user_champions SET equipped_weapon_id = ? WHERE id = ?', [itemId, championId]);
                await interaction.update({ content: 'Equipment updated!', components: [] });
            } catch (error) {
                console.error('Error updating weapon:', error);
                await interaction.update({ content: 'An error occurred while updating equipment.', components: [] });
            }
        } else if (interaction.customId.startsWith('equip_armor_')) {
            try {
                const championId = interaction.customId.replace('equip_armor_', '');
                const itemId = interaction.values[0];
                await db.execute('UPDATE user_champions SET equipped_armor_id = ? WHERE id = ?', [itemId, championId]);
                await interaction.update({ content: 'Equipment updated!', components: [] });
            } catch (error) {
                console.error('Error updating armor:', error);
                await interaction.update({ content: 'An error occurred while updating equipment.', components: [] });
            }
        } else if (interaction.customId.startsWith('equip_ability_')) {
            try {
                const championId = interaction.customId.replace('equip_ability_', '');
                const itemId = interaction.values[0];
                await db.execute('UPDATE user_champions SET equipped_ability_id = ? WHERE id = ?', [itemId, championId]);
                await interaction.update({ content: 'Equipment updated!', components: [] });
            } catch (error) {
                console.error('Error updating ability:', error);
                await interaction.update({ content: 'An error occurred while updating equipment.', components: [] });
            }
        } else if (interaction.customId === 'craft_item_select') {
            try {
                const recipeId = interaction.values[0];
                const userId = interaction.user.id;

                const [[recipe]] = await db.execute('SELECT id, name, output_item_id FROM recipes WHERE id = ?', [recipeId]);
                if (!recipe) {
                    await interaction.update({ content: 'Recipe not found.', components: [] });
                    return;
                }

                const [ingredients] = await db.execute('SELECT item_id, quantity FROM recipe_ingredients WHERE recipe_id = ?', [recipeId]);

                for (const ing of ingredients) {
                    const [[inv]] = await db.execute('SELECT quantity FROM user_inventory WHERE user_id = ? AND item_id = ?', [userId, ing.item_id]);
                    if (!inv || inv.quantity < ing.quantity) {
                        await interaction.update({ content: 'You lack the required materials.', components: [] });
                        return;
                    }
                }

                for (const ing of ingredients) {
                    await db.execute('UPDATE user_inventory SET quantity = quantity - ? WHERE user_id = ? AND item_id = ?', [ing.quantity, userId, ing.item_id]);
                    await db.execute('DELETE FROM user_inventory WHERE user_id = ? AND item_id = ? AND quantity <= 0', [userId, ing.item_id]);
                }

                await db.execute('INSERT INTO user_inventory (user_id, item_id, quantity) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1', [userId, recipe.output_item_id]);

                await interaction.update({ content: `You successfully crafted ${recipe.name}!`, components: [] });
            } catch (error) {
                console.error('Error crafting item:', error);
                await interaction.update({ content: 'An error occurred while crafting.', components: [] });
            }
        }
        return;
    }
});


function generateRandomChampion() {
    const commonHeroes = getHeroes().filter(h => h.rarity === 'Common' && !h.is_monster);
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
