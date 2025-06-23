const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const db = require('./util/database');
const { simple } = require('./src/utils/embedBuilder');
const confirmEmbed = require('./src/utils/confirm');
const {
  allPossibleHeroes,
  allPossibleWeapons,
  allPossibleArmors,
  allPossibleAbilities
} = require('../backend/game/data');
const { loadAllData, gameData, getHeroes, getHeroById, getMonsters } = require('./util/gameData');
const { createCombatant } = require('../backend/game/utils');
const GameEngine = require('../backend/game/engine');
const { getTownMenu } = require('./commands/town.js');

// Booster pack definitions for the marketplace
const BOOSTER_PACKS = {
    // All packs cost 100 Gold but maintain their internal rarity for card generation
    hero_pack: { name: 'Hero Pack', cost: 100, currency: 'soft_currency', type: 'hero_pack', rarity: 'basic' },
    ability_pack: { name: 'Ability Pack', cost: 100, currency: 'soft_currency', type: 'ability_pack', rarity: 'standard' },
    weapon_pack: { name: 'Weapon Pack', cost: 100, currency: 'soft_currency', type: 'weapon_pack', rarity: 'premium' },
    armor_pack: { name: 'Armor Pack', cost: 100, currency: 'soft_currency', type: 'armor_pack', rarity: 'basic' }
};


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

// In-memory map to track active tutorial drafts
// Key: userId, Value: { currentChampNum: 1, stage: 'hero_selection', champion1: {}, champion2: {} }
const activeTutorialDrafts = new Map();
// In-memory map to track active deck edits
// Key: userId, Value: { championId: number, deck: number[] }
const activeDeckEdits = new Map();

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


// --- NEW HELPER FUNCTION: Calculate effective champion stats and get deck info ---
/**
 * Calculates a champion's effective stats and retrieves its deck ability.
 * @param {object} championDbData - Data from user_champions table (includes equipped IDs).
 * @returns {object} An object containing effective stats and deck ability name.
 */
async function getDetailedChampionInfo(championDbData) {
    const hero = gameData.heroes.get(championDbData.base_hero_id);
    const weapon = gameData.weapons.get(championDbData.equipped_weapon_id);
    const armor = gameData.armors.get(championDbData.equipped_armor_id);

    if (!hero) {
        return {
            name: `Unknown Hero (ID: ${championDbData.base_hero_id})`,
            stats: 'N/A',
            deck: 'N/A',
            rarity: 'Unknown',
            class: 'Unknown',
            level: championDbData.level
        };
    }

    let effectiveHp = hero.hp;
    let effectiveAttack = hero.attack;
    let effectiveSpeed = hero.speed;
    let effectiveBlock = 0;
    let effectiveMagicResist = 0;

    if (weapon && weapon.statBonuses) {
        if (weapon.statBonuses.HP) effectiveHp += weapon.statBonuses.HP;
        if (weapon.statBonuses.ATK) effectiveAttack += weapon.statBonuses.ATK;
        if (weapon.statBonuses.SPD) effectiveSpeed += weapon.statBonuses.SPD;
    }

    if (armor && armor.statBonuses) {
        if (armor.statBonuses.HP) effectiveHp += armor.statBonuses.HP;
        if (armor.statBonuses.ATK) effectiveAttack += armor.statBonuses.ATK;
        if (armor.statBonuses.SPD) effectiveSpeed += armor.statBonuses.SPD;
        if (armor.statBonuses.Block) effectiveBlock += armor.statBonuses.Block;
        if (armor.statBonuses.MagicResist) effectiveMagicResist += armor.statBonuses.MagicResist;
    }

    const [deckAbilities] = await db.execute(
        `SELECT a.name FROM champion_decks cd JOIN abilities a ON cd.ability_id = a.id WHERE cd.user_champion_id = ? ORDER BY cd.order_index ASC LIMIT 1`,
        [championDbData.id]
    );

    const deckInfo = deckAbilities.length > 0
        ? deckAbilities.map(ab => ab.name).join(', ')
        : 'None (Manage to create a deck)';

    return {
        id: championDbData.id,
        name: hero.name,
        class: hero.class,
        rarity: hero.rarity,
        level: championDbData.level,
        hp: effectiveHp,
        attack: effectiveAttack,
        speed: effectiveSpeed,
        block: effectiveBlock,
        magicResist: effectiveMagicResist,
        deck: deckInfo,
        imageUrl: hero.imageUrl
    };
}
// --- END NEW HELPER FUNCTION ---

// Helper for booster packs
function getRandomCardsForPack(pool, count, packRarity) {
    let allowedRarities;
    switch (packRarity) {
        case 'premium':
            allowedRarities = ['Uncommon', 'Rare', 'Epic'];
            break;
        case 'standard':
            allowedRarities = ['Common', 'Uncommon', 'Rare'];
            break;
        case 'basic':
        default:
            allowedRarities = ['Common', 'Uncommon'];
            break;
    }

    const filteredPool = pool.filter(item => allowedRarities.includes(item.rarity));
    const shuffled = [...filteredPool].sort(() => 0.5 - Math.random());
    const uniqueCards = [];
    const uniqueIds = new Set();

    for (const card of shuffled) {
        if (!uniqueIds.has(card.id)) {
            uniqueCards.push(card);
            uniqueIds.add(card.id);
            if (uniqueCards.length >= count) break;
        }
    }

    while (uniqueCards.length < count) {
        const fallback = pool[Math.floor(Math.random() * pool.length)];
        if (!uniqueIds.has(fallback.id)) {
            uniqueCards.push(fallback);
            uniqueIds.add(fallback.id);
        }
    }

    return uniqueCards;
}


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
        if (interaction.commandName === 'start') {
            const userId = interaction.user.id;
            try {
                const [[user]] = await db.execute('SELECT tutorial_completed FROM users WHERE discord_id = ?', [userId]);
                if (user && user.tutorial_completed) {
                    await interaction.reply({
                        embeds: [simple('Welcome back!', [{ name: 'Journey On!', value: 'You\'ve already completed the champion tutorial. Use `/town` to access game features.' }])],
                        ephemeral: true
                    });
                    return;
                }
                const command = client.commands.get(interaction.commandName);
                if (command) {
                    await command.execute(interaction); // Send initial welcome embed
                }
                // Initialize tutorial state for two champions
                activeTutorialDrafts.set(userId, {
                    currentChampNum: 1, // Start with champion 1
                    stage: 'INITIAL_GREETING',
                    champion1: {},
                    champion2: {}
                });
            } catch (error) {
                console.error('Error checking tutorial status or executing start command:', error);
                await interaction.reply({ content: 'There was an error starting your adventure!', ephemeral: true });
            }
            return;
        }
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
                        `SELECT uc.*, h.name, h.class FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.id = ? AND uc.user_id = ?`,
                        [championId, userId]
                    );
                    if (rows.length === 0) {
                        await interaction.reply({ content: 'Champion not found.', ephemeral: true });
                        return;
                    }
                    const champ = rows[0];

                    // Fetch current deck abilities for this champion
                    const [deckRows] = await db.execute(
                        `SELECT cd.ability_id, a.name FROM champion_decks cd JOIN abilities a ON cd.ability_id = a.id WHERE cd.user_champion_id = ? ORDER BY cd.order_index ASC`,
                        [championId]
                    );
                    const currentDeckAbilities = deckRows.map(row => row.name).join(', ') || 'None';

                    // Fetch available ability cards from inventory that match champion's class
                    const [invAbilityRows] = await db.execute(
                        `SELECT ui.item_id, a.name FROM user_inventory ui JOIN abilities a ON ui.item_id = a.id WHERE ui.user_id = ? AND a.class = ? AND ui.quantity > 0`,
                        [userId, champ.class]
                    );
                    const availableAbilityOptions = invAbilityRows.map(item => ({
                        label: item.name,
                        description: `Ability ID: ${item.item_id}`,
                        value: String(item.item_id),
                    }));

                    const embed = new EmbedBuilder()
                        .setColor('#29b6f6')
                        .setTitle(`⚙️ Manage ${champ.name}`)
                        .setThumbnail(getHeroById(champ.base_hero_id).imageUrl || null)
                        .addFields(
                            { name: 'Level', value: String(champ.level), inline: true },
                            { name: 'XP', value: String(champ.xp || 0), inline: true },
                            { name: 'Equipped Weapon', value: champ.equipped_weapon_id ? (allPossibleWeapons.find(w => w.id === champ.equipped_weapon_id)?.name || `ID ${champ.equipped_weapon_id}`) : 'None', inline: true },
                            { name: 'Equipped Armor', value: champ.equipped_armor_id ? (allPossibleArmors.find(a => a.id === champ.equipped_armor_id)?.name || `ID ${champ.equipped_armor_id}`) : 'None', inline: true },
                            { name: 'Equipped Ability (Slot 1)', value: champ.equipped_ability_id ? (allPossibleAbilities.find(ab => ab.id === champ.equipped_ability_id)?.name || `ID ${champ.equipped_ability_id}`) : 'None', inline: true },
                            { name: 'Deck Abilities', value: currentDeckAbilities, inline: false }
                        );

                    const components = [];
                    if (availableAbilityOptions.length > 0) {
                        const deckAbilitySelect = new StringSelectMenuBuilder()
                            .setCustomId(`manage_deck_ability_${championId}`)
                            .setPlaceholder('Add an ability to deck (1st slot only)')
                            .setMinValues(1)
                            .setMaxValues(1)
                            .addOptions(availableAbilityOptions.slice(0, 25));
                        components.push(new ActionRowBuilder().addComponents(deckAbilitySelect));
                    } else {
                        components.push(new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('no_abilities_available')
                                .setLabel('No Abilities Available for Deck')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        ));
                    }

                    const navigationRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_to_barracks_from_champ').setLabel('Back to Roster').setStyle(ButtonStyle.Secondary).setEmoji('⬅️'),
                            new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('🏠')
                        );
                    components.push(navigationRow);

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
        const userId = interaction.user.id;
        const userDraftState = activeTutorialDrafts.get(userId);
        if (interaction.customId.startsWith('tutorial_') || userDraftState) {
            try {
                await interaction.deferUpdate();
                switch (interaction.customId) {
                    case 'tutorial_start_draft': // Initial button to start Champion 1 draft
                        userDraftState.stage = 'HERO_SELECTION';
                        await sendHeroSelectionStep(interaction, userId, userDraftState.currentChampNum);
                        break;
                    case 'tutorial_recap_1_continue':
                        userDraftState.currentChampNum = 2;
                        userDraftState.stage = 'HERO_SELECTION';
                        await sendHeroSelectionStep(interaction, userId, userDraftState.currentChampNum);
                        break;
                    case 'tutorial_recap_2_finalize':
                        await finalizeChampionTeam(interaction, userId);
                        break;
                    case 'tutorial_start_over':
                        activeTutorialDrafts.delete(userId);
                        await interaction.editReply({
                            embeds: [simple('Draft Reset', [{ name: 'Starting Over!', value: 'Your champion draft has been reset. Use `/start` to begin again.' }])],
                            components: []
                        });
                        break;
                    default:
                        console.log(`Unhandled tutorial interaction: ${interaction.customId}`);
                        await interaction.editReply({ content: 'Something went wrong with the tutorial step. Please try `/start` again.', components: [] });
                        activeTutorialDrafts.delete(userId);
                }
            } catch (error) {
                console.error(`Error handling tutorial step ${interaction.customId}:`, error);
                await interaction.editReply({ content: 'An error occurred during the tutorial. Please try `/start` again.', components: [] });
                activeTutorialDrafts.delete(userId);
            }
            return;
        }
        try {
            switch (interaction.customId) {
                case 'town_summon': {
                    const [userRows] = await db.execute('SELECT summoning_shards, corrupted_lodestones FROM users WHERE discord_id = ?', [interaction.user.id]);
                    const user = userRows[0] || { summoning_shards: 0, corrupted_lodestones: 0 };

                    const summonEmbed = simple(
                        'The Summoning Circle',
                        [
                            { name: 'Choose Your Method', value: 'Use Shards to recruit champions or a Lodestone to unleash a monster.' },
                            { name: 'Your Shards', value: `✨ ${user.summoning_shards}`, inline: true },
                            { name: 'Your Lodestones', value: `🔥 ${user.corrupted_lodestones}`, inline: true }
                        ]
                    );
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

                    const embed = new EmbedBuilder()
                        .setColor('#29b6f6')
                        .setTitle(summonedHero.name.toUpperCase())
                        .setImage(summonedHero.imageUrl)
                        .addFields(
                            { name: 'HP', value: `**${summonedHero.hp}**`, inline: true },
                            { name: 'Attack', value: `**${summonedHero.attack}**`, inline: true },
                            { name: 'Class', value: summonedHero.class, inline: false }
                        )
                        .setFooter({ text: 'Auto-Battler Bot' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    const disabledRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('summon_champion').setLabel('Summon Champion (10 Shards)').setStyle(ButtonStyle.Success).setEmoji('✨').setDisabled(true),
                            new ButtonBuilder().setCustomId('unleash_monster').setLabel('Unleash Monster (1 Lodestone)').setStyle(ButtonStyle.Danger).setEmoji('🔥').setDisabled(true)
                        );
                    await interaction.message.edit({ components: [disabledRow] });

                    const enabledRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('summon_champion').setLabel('Summon Champion (10 Shards)').setStyle(ButtonStyle.Success).setEmoji('✨').setDisabled(false),
                            new ButtonBuilder().setCustomId('unleash_monster').setLabel('Unleash Monster (1 Lodestone)').setStyle(ButtonStyle.Danger).setEmoji('🔥').setDisabled(false)
                        );
                    setTimeout(() => {
                        interaction.message.edit({ components: [enabledRow] }).catch(console.error);
                    }, 5000);
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

                    const embed = new EmbedBuilder()
                        .setColor('#e11d48')
                        .setTitle(summonedMonster.name.toUpperCase())
                        .setImage(summonedMonster.imageUrl)
                        .addFields(
                            { name: 'HP', value: `**${summonedMonster.hp}**`, inline: true },
                            { name: 'Attack', value: `**${summonedMonster.attack}**`, inline: true },
                            { name: 'Trait', value: summonedMonster.trait, inline: false }
                        )
                        .setFooter({ text: 'Auto-Battler Bot' })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    const disabledRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('summon_champion').setLabel('Summon Champion (10 Shards)').setStyle(ButtonStyle.Success).setEmoji('✨').setDisabled(true),
                            new ButtonBuilder().setCustomId('unleash_monster').setLabel('Unleash Monster (1 Lodestone)').setStyle(ButtonStyle.Danger).setEmoji('🔥').setDisabled(true)
                        );
                    await interaction.message.edit({ components: [disabledRow] });

                    const enabledRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('summon_champion').setLabel('Summon Champion (10 Shards)').setStyle(ButtonStyle.Success).setEmoji('✨').setDisabled(false),
                            new ButtonBuilder().setCustomId('unleash_monster').setLabel('Unleash Monster (1 Lodestone)').setStyle(ButtonStyle.Danger).setEmoji('🔥').setDisabled(false)
                        );
                    setTimeout(() => {
                        interaction.message.edit({ components: [enabledRow] }).catch(console.error);
                    }, 5000);
                    break;
                }
                case 'town_barracks': {
                    await interaction.deferUpdate();

                    const userId = interaction.user.id;

                    const [userRows] = await db.execute('SELECT soft_currency, hard_currency, summoning_shards, corrupted_lodestones FROM users WHERE discord_id = ?', [userId]);
                    const user = userRows[0] || {};

                    const [rosterDbData] = await db.execute(
                        `SELECT
                            uc.id, uc.base_hero_id, uc.level, uc.xp,
                            uc.equipped_weapon_id, uc.equipped_armor_id, uc.equipped_ability_id
                         FROM user_champions uc
                         WHERE uc.user_id = ? ORDER BY uc.level DESC, uc.id DESC LIMIT 25`,
                        [userId]
                    );

                    const detailedRosterInfo = [];
                    for (const champDbData of rosterDbData) {
                        const info = await getDetailedChampionInfo(champDbData);
                        detailedRosterInfo.push(info);
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#78716c')
                        .setTitle(`${interaction.user.username}'s Barracks`)
                        .addFields(
                            { name: 'Gold', value: `🪙 ${user.soft_currency || 0}`, inline: true },
                            { name: 'Gems', value: `💎 ${user.hard_currency || 0}`, inline: true },
                            { name: 'Summoning Shards', value: `✨ ${user.summoning_shards || 0}`, inline: true }
                        );

                    if (detailedRosterInfo.length > 0) {
                        const rosterString = detailedRosterInfo.map(c =>
                            `**${c.name}** (Lvl ${c.level}) - *${c.rarity} ${c.class}*\n` +
                            `  HP: ${c.hp} | ATK: ${c.attack} | SPD: ${c.speed}\n` +
                            `  Def: ${c.block} Block / ${c.magicResist} Magic Resist\n` +
                            `  Deck: ${c.deck}`
                        ).join('\n\n');
                        embed.addFields({ name: 'Champion Roster', value: rosterString });
                    } else {
                        embed.addFields({ name: 'Champion Roster', value: 'Your roster is empty. Visit the Summoning Circle!' });
                    }

                    const navigationRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('⬅️'),
                            new ButtonBuilder().setCustomId('manage_champions_selection').setLabel('Manage Champions').setStyle(ButtonStyle.Primary).setEmoji('⚙️')
                        );

                    await interaction.editReply({ embeds: [embed], components: [navigationRow] });
                    break;
                }
                case 'manage_champions_selection': {
                    await interaction.deferUpdate();

                    const userId = interaction.user.id;
                    const [ownedChampions] = await db.execute(
                        'SELECT uc.id, h.name, uc.level, h.class, h.rarity FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.user_id = ?',
                        [userId]
                    );

                    if (ownedChampions.length === 0) {
                        await interaction.editReply({ content: 'You have no champions to manage!', components: [] });
                        return;
                    }

                    const championOptions = ownedChampions.map(champ => ({
                        label: `${champ.name} (Lvl ${champ.level})`,
                        description: `${champ.rarity} ${champ.class}`,
                        value: String(champ.id),
                    }));

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('select_champion_to_manage')
                        .setPlaceholder('Select a Champion to Manage')
                        .addOptions(championOptions.slice(0, 25));

                    const row = new ActionRowBuilder().addComponents(selectMenu);
                    const backButton = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_to_barracks').setLabel('Back to Barracks').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
                        );


                    await interaction.editReply({
                        embeds: [simple('Manage Your Champions', [{ name: 'Choose a Champion', value: 'Select a champion to view their details and modify their deck.' }])],
                        components: [row, backButton]
                    });
                    break;
                }
                case 'back_to_barracks_from_champ':
                case 'back_to_barracks': {
                    await interaction.deferUpdate();

                    const userId = interaction.user.id;
                    const [userRows] = await db.execute('SELECT soft_currency, hard_currency, summoning_shards, corrupted_lodestones FROM users WHERE discord_id = ?', [userId]);
                    const user = userRows[0] || {};

                    const [rosterDbData] = await db.execute(
                        `SELECT
                            uc.id, uc.base_hero_id, uc.level, uc.xp,
                            uc.equipped_weapon_id, uc.equipped_armor_id, uc.equipped_ability_id
                         FROM user_champions uc
                         WHERE uc.user_id = ? ORDER BY uc.level DESC, uc.id DESC LIMIT 25`,
                        [userId]
                    );

                    const detailedRosterInfo = [];
                    for (const champDbData of rosterDbData) {
                        const info = await getDetailedChampionInfo(champDbData);
                        detailedRosterInfo.push(info);
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#78716c')
                        .setTitle(`${interaction.user.username}'s Barracks`)
                        .addFields(
                            { name: 'Gold', value: `🪙 ${user.soft_currency || 0}`, inline: true },
                            { name: 'Gems', value: `💎 ${user.hard_currency || 0}`, inline: true },
                            { name: 'Summoning Shards', value: `✨ ${user.summoning_shards || 0}`, inline: true }
                        );

                    if (detailedRosterInfo.length > 0) {
                        const rosterString = detailedRosterInfo.map(c =>
                            `**${c.name}** (Lvl ${c.level}) - *${c.rarity} ${c.class}*\n` +
                            `  HP: ${c.hp} | ATK: ${c.attack} | SPD: ${c.speed}\n` +
                            `  Def: ${c.block} Block / ${c.magicResist} Magic Resist\n` +
                            `  Deck: ${c.deck}`
                        ).join('\n\n');
                        embed.addFields({ name: 'Champion Roster', value: rosterString });
                    } else {
                        embed.addFields({ name: 'Champion Roster', value: 'Your roster is empty. Visit the Summoning Circle!' });
                    }

                    const navigationRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('⬅️'),
                            new ButtonBuilder().setCustomId('manage_champions_selection').setLabel('Manage Champions').setStyle(ButtonStyle.Primary).setEmoji('⚙️')
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
                    await interaction.deferUpdate();

                    const marketEmbed = simple(
                        '💰 The Grand Bazaar',
                        [{ name: 'Welcome to the Marketplace!', value: 'Here you can buy various goods for your journey.' }]
                    );

                    const storeButton = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('market_store_view').setLabel('Booster Pack Store').setStyle(ButtonStyle.Primary).setEmoji('📦')
                        );
                    const navigationRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
                        );

                    await interaction.editReply({ embeds: [marketEmbed], components: [storeButton, navigationRow] });
                    break;
                }
                case 'market_store_view': {
                    await interaction.deferUpdate();

                    const storeEmbed = simple(
                        '🛍️ Booster Pack Store',
                        [{ name: 'Available Packs', value: 'Choose a pack to acquire new cards!' }]
                    );

                    const components = [];
                    for (const [packId, packInfo] of Object.entries(BOOSTER_PACKS)) {
                        components.push(
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`buy_pack_${packId}`)
                                        .setLabel(`${packInfo.name} (${packInfo.cost} ${packInfo.currency === 'soft_currency' ? 'Gold 🪙' : 'Gems 💎'})`)
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('🛒')
                                )
                        );
                    }

                    const backButton = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_to_market').setLabel('Back to Marketplace').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
                        );
                    components.push(backButton);

                    await interaction.editReply({ embeds: [storeEmbed], components: components });
                    break;
                }
                case (interaction.customId.startsWith('buy_pack_') ? interaction.customId : ''): {
                    await interaction.deferUpdate();
                    const packId = interaction.customId.replace('buy_pack_', '');
                    const packInfo = BOOSTER_PACKS[packId];

                    if (!packInfo) {
                        await interaction.editReply({ content: 'Invalid pack selected.', ephemeral: true });
                        return;
                    }

                    const [userRows] = await db.execute(`SELECT ${packInfo.currency} FROM users WHERE discord_id = ?`, [userId]);
                    const user = userRows[0];

                    if (!user || user[packInfo.currency] < packInfo.cost) {
                        await interaction.editReply({
                            content: `You don't have enough ${packInfo.currency === 'soft_currency' ? 'Gold 🪙' : 'Gems 💎'} to buy the ${packInfo.name}! You need ${packInfo.cost}.`,
                            ephemeral: true
                        });
                        return;
                    }

                    await db.execute(
                        `UPDATE users SET ${packInfo.currency} = ${packInfo.currency} - ? WHERE discord_id = ?`,
                        [packInfo.cost, userId]
                    );

                    let cardPool = [];
                    let awardedCardsCount = 0;
                    let actualItemType = '';

                    switch (packInfo.type) {
                        case 'hero_pack':
                            cardPool = allPossibleHeroes.filter(h => !h.isMonster);
                            awardedCardsCount = 1;
                            actualItemType = 'hero';
                            break;
                        case 'ability_pack':
                            cardPool = allPossibleAbilities;
                            awardedCardsCount = 3;
                            actualItemType = 'ability';
                            break;
                        case 'weapon_pack':
                            cardPool = allPossibleWeapons;
                            awardedCardsCount = 2;
                            actualItemType = 'weapon';
                            break;
                        case 'armor_pack':
                            cardPool = allPossibleArmors;
                            awardedCardsCount = 2;
                            actualItemType = 'armor';
                            break;
                    }
                    const awardedCards = getRandomCardsForPack(cardPool, awardedCardsCount, packInfo.rarity);

                    const cardNames = [];
                    for (const card of awardedCards) {
                        cardNames.push(`**${card.name}** (${card.rarity})`);
                        try {
                            await db.execute(
                                `INSERT INTO user_inventory (user_id, item_id, quantity, item_type)
                                 VALUES (?, ?, 1, ?)
                                 ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
                                [userId, card.id, actualItemType]
                            );
                        } catch (error) {
                            console.error(`Error adding card ${card.id} to inventory for user ${userId} during purchase:`, error);
                        }
                    }

                    const resultsEmbed = new EmbedBuilder()
                        .setColor('#FDE047')
                        .setTitle(`✨ ${packInfo.name} Opened! ✨`)
                        .setDescription(`You spent ${packInfo.cost} ${packInfo.currency === 'soft_currency' ? 'Gold 🪙' : 'Gems 💎'}.`)
                        .addFields({ name: 'Cards Received:', value: cardNames.join('\n') || 'No cards received.', inline: false })
                        .setFooter({ text: 'Your new cards have been added to your collection!' })
                        .setTimestamp();

                    await interaction.editReply({ embeds: [resultsEmbed] });
                    break;
                }
                case 'back_to_market': {
                    await interaction.deferUpdate();
                    const marketEmbed = simple(
                        '💰 The Grand Bazaar',
                        [{ name: 'Welcome to the Marketplace!', value: 'Here you can buy various goods for your journey.' }]
                    );
                    const storeButton = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('market_store_view').setLabel('Booster Pack Store').setStyle(ButtonStyle.Primary).setEmoji('📦')
                        );
                    const navigationRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
                        );
                    await interaction.editReply({ embeds: [marketEmbed], components: [storeButton, navigationRow] });
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
        const userId = interaction.user.id;
        const userDraftState = activeTutorialDrafts.get(userId);
        if (interaction.customId.startsWith('tutorial_') || userDraftState) {
            try {
                await interaction.deferUpdate();

                // Determine which champion's data to update based on currentChampNum
                const currentChampionData = userDraftState.currentChampNum === 1 ? userDraftState.champion1 : userDraftState.champion2;
                const champNum = userDraftState.currentChampNum;

                switch (interaction.customId) {
                    case `tutorial_select_hero_${champNum}`:
                        currentChampionData.heroId = parseInt(interaction.values[0]);
                        userDraftState.stage = 'ABILITY_SELECTION';
                        await sendAbilitySelectionStep(interaction, userId, champNum);
                        break;
                    case `tutorial_select_ability_${champNum}`:
                        currentChampionData.abilityId = parseInt(interaction.values[0]);
                        userDraftState.stage = 'WEAPON_SELECTION';
                        await sendWeaponSelectionStep(interaction, userId, champNum);
                        break;
                    case `tutorial_select_weapon_${champNum}`:
                        currentChampionData.weaponId = parseInt(interaction.values[0]);
                        userDraftState.stage = 'ARMOR_SELECTION';
                        await sendArmorSelectionStep(interaction, userId, champNum);
                        break;
                    case `tutorial_select_armor_${champNum}`:
                        currentChampionData.armorId = parseInt(interaction.values[0]);
                        if (userDraftState.currentChampNum === 1) {
                            userDraftState.stage = 'RECAP_1';
                            await sendChampionRecapStep(interaction, userId, userDraftState.currentChampNum);
                        } else {
                            userDraftState.stage = 'RECAP_2';
                            await sendChampionRecapStep(interaction, userId, userDraftState.currentChampNum);
                        }
                        break;
                    default:
                        console.log(`Unhandled tutorial interaction (select menu): ${interaction.customId}`);
                        await interaction.editReply({ content: 'Something went wrong with the tutorial step. Please try `/start` again.', components: [] });
                        activeTutorialDrafts.delete(userId);
                }
            } catch (error) {
                console.error(`Error handling tutorial select menu ${interaction.customId}:`, error);
                await interaction.editReply({ content: 'An error occurred during the tutorial. Please try `/start` again.', components: [] });
                activeTutorialDrafts.delete(userId);
            }
            return;
        }
        if (interaction.customId === 'select_champion_to_manage') {
            await interaction.deferUpdate();
            const selectedChampionId = parseInt(interaction.values[0]);

            const [champRows] = await db.execute(
                `SELECT uc.*, h.name, h.class FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.id = ? AND uc.user_id = ?`,
                [selectedChampionId, userId]
            );
            if (champRows.length === 0) {
                await interaction.editReply({ content: 'Champion not found in your roster.', components: [] });
                return;
            }
            const champion = champRows[0];

            const [availableAbilities] = await db.execute(
                `SELECT ui.item_id, a.name, a.energy_cost, a.effect FROM user_inventory ui JOIN abilities a ON ui.item_id = a.id WHERE ui.user_id = ? AND a.class = ? AND ui.quantity > 0`,
                [userId, champion.class]
            );
            const abilityOptions = availableAbilities.map(ability => ({
                label: ability.name,
                description: `⚡ ${ability.energy_cost} | ${ability.effect}`,
                value: String(ability.item_id),
            }));

            const [deckRows] = await db.execute(
                `SELECT cd.ability_id, a.name FROM champion_decks cd JOIN abilities a ON cd.ability_id = a.id WHERE cd.user_champion_id = ? ORDER BY cd.order_index ASC`,
                [selectedChampionId]
            );
            const currentDeckAbilities = deckRows.map(row => row.name).join(', ') || 'None';

            const embed = new EmbedBuilder()
                .setColor('#29b6f6')
                .setTitle(`Managing: ${champion.name}`)
                .setThumbnail(getHeroById(champion.base_hero_id).imageUrl || null)
                .addFields(
                    { name: 'Champion Info', value: `Level: ${champion.level} | Class: ${champion.class}`, inline: false },
                    { name: 'Current Deck Abilities', value: currentDeckAbilities, inline: false }
                );

            const components = [];
            if (abilityOptions.length > 0) {
                const addAbilitySelectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`manage_deck_ability_${selectedChampionId}`)
                    .setPlaceholder('Add an Ability to Deck (Slot 1)')
                    .addOptions(abilityOptions.slice(0, 25));
                components.push(new ActionRowBuilder().addComponents(addAbilitySelectMenu));
            } else {
                components.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('no_abilities_for_deck')
                        .setLabel('No Abilities Available in Inventory')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                ));
            }

            // New button to access full deck editor
            components.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`edit_champion_deck_${selectedChampionId}`)
                    .setLabel('Edit Deck')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📚')
            ));

            const navigationRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('back_to_barracks_from_champ').setLabel('Back to Roster').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
                );
            components.push(navigationRow);

            await interaction.editReply({ embeds: [embed], components: components });
            return;
        }
        if (interaction.customId.startsWith('manage_deck_ability_')) {
            await interaction.deferUpdate();
            const championId = parseInt(interaction.customId.replace('manage_deck_ability_', ''));
            const abilityId = parseInt(interaction.values[0]);

            try {
                await db.execute(
                    `DELETE FROM champion_decks WHERE user_champion_id = ? AND order_index = 0`,
                    [championId]
                );

                await db.execute(
                    `INSERT INTO champion_decks (user_champion_id, ability_id, order_index) VALUES (?, ?, ?)`,
                    [championId, abilityId, 0]
                );

                const selectedAbility = allPossibleAbilities.find(a => a.id === abilityId);

                const [champRows] = await db.execute(
                    `SELECT uc.*, h.name, h.class FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.id = ? AND uc.user_id = ?`,
                    [championId, userId]
                );
                const updatedChampion = champRows[0];

                const [deckRows] = await db.execute(
                    `SELECT cd.ability_id, a.name FROM champion_decks cd JOIN abilities a ON cd.ability_id = a.id WHERE cd.user_champion_id = ? ORDER BY cd.order_index ASC`,
                    [championId]
                );
                const currentDeckAbilities = deckRows.map(row => row.name).join(', ') || 'None';

                const embed = new EmbedBuilder()
                    .setColor('#29b6f6')
                    .setTitle(`Managing: ${updatedChampion.name}`)
                    .setThumbnail(getHeroById(updatedChampion.base_hero_id).imageUrl || null)
                    .addFields(
                        { name: 'Champion Info', value: `Level: ${updatedChampion.level} | Class: ${updatedChampion.class}`, inline: false },
                        { name: 'Current Deck Abilities', value: currentDeckAbilities, inline: false },
                        { name: 'Equipped Ability (Slot 1)', value: updatedChampion.equipped_ability_id ? (allPossibleAbilities.find(ab => ab.id === updatedChampion.equipped_ability_id)?.name || `ID ${updatedChampion.equipped_ability_id}`) : 'None', inline: true },
                        { name: 'Deck Update', value: `**${selectedAbility.name}** added to deck!`, inline: false }
                    );

                const [availableAbilitiesAfterEquip] = await db.execute(
                    `SELECT ui.item_id, a.name, a.energy_cost, a.effect FROM user_inventory ui JOIN abilities a ON ui.item_id = a.id WHERE ui.user_id = ? AND a.class = ? AND ui.quantity > 0`,
                    [userId, updatedChampion.class]
                );
                const abilityOptionsAfterEquip = availableAbilitiesAfterEquip.map(ability => ({
                    label: ability.name,
                    description: `⚡ ${ability.energy_cost} | ${ability.effect}`,
                    value: String(ability.item_id),
                }));

                const components = [];
                if (abilityOptionsAfterEquip.length > 0) {
                    const addAbilitySelectMenu = new StringSelectMenuBuilder()
                        .setCustomId(`manage_deck_ability_${championId}`)
                        .setPlaceholder('Add an Ability to Deck (Slot 1)')
                        .addOptions(abilityOptionsAfterEquip.slice(0, 25));
                    components.push(new ActionRowBuilder().addComponents(addAbilitySelectMenu));
                } else {
                     components.push(new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('no_abilities_for_deck')
                                .setLabel('No Abilities Available in Inventory')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        ));
                }

                const navigationRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('back_to_barracks_from_champ').setLabel('Back to Roster').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
                    );
                components.push(navigationRow);

                await interaction.editReply({ embeds: [embed], components: components });

            } catch (error) {
                console.error('Error adding ability to deck:', error);
                await interaction.editReply({ content: 'An error occurred while adding the ability to the deck.', components: [] });
            }
            return;
        }

        // --- Deck Editor Interaction Handlers ---
        if (interaction.customId.startsWith('edit_champion_deck_')) {
            const championId = parseInt(interaction.customId.replace('edit_champion_deck_', ''));
            await interaction.deferUpdate();
            try {
                await sendDeckEditScreen(interaction, userId, championId);
            } catch (err) {
                console.error('Error preparing deck editor:', err);
                await interaction.editReply({ content: 'Failed to open deck editor.', components: [] });
            }
            return;
        }

        if (interaction.customId.startsWith('deck_add_')) {
            await interaction.deferUpdate();
            const championId = parseInt(interaction.customId.replace('deck_add_', ''));
            const abilityId = parseInt(interaction.values[0]);
            const state = activeDeckEdits.get(userId);
            if (!state || state.championId !== championId) return;

            const count = state.deck.filter(id => id === abilityId).length;
            const champ = state.champion;
            if (state.deck.length >= 20 || count >= 2) {
                const embed = buildDeckEditEmbed(champ, state.deck);
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            state.deck.push(abilityId);
            const embed = buildDeckEditEmbed(champ, state.deck);
            const [availableAbilities] = await db.execute(
                `SELECT ui.item_id, a.name FROM user_inventory ui JOIN abilities a ON ui.item_id = a.id WHERE ui.user_id = ? AND a.class = ? AND ui.quantity > 0`,
                [userId, champ.class]
            );
            const addMenu = new StringSelectMenuBuilder()
                .setCustomId(`deck_add_${championId}`)
                .setPlaceholder('Add Ability')
                .addOptions(availableAbilities.map(a => ({ label: a.name, value: String(a.item_id) })).slice(0, 25));
            const removeMenu = new StringSelectMenuBuilder()
                .setCustomId(`deck_remove_${championId}`)
                .setPlaceholder('Remove Ability')
                .addOptions(Array.from(new Set(state.deck)).map(id => ({ label: allPossibleAbilities.find(ab => ab.id === id)?.name || `ID ${id}`, value: String(id) })).slice(0, 25));
            const controlsRow1 = new ActionRowBuilder().addComponents(addMenu);
            const controlsRow2 = new ActionRowBuilder().addComponents(removeMenu);
            const controlsRow3 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`deck_save_${championId}`).setLabel('Save Deck').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`deck_cancel_${championId}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
            );
            await interaction.editReply({ embeds: [embed], components: [controlsRow1, controlsRow2, controlsRow3] });
            return;
        }

        if (interaction.customId.startsWith('deck_remove_')) {
            await interaction.deferUpdate();
            const championId = parseInt(interaction.customId.replace('deck_remove_', ''));
            const abilityId = parseInt(interaction.values[0]);
            const state = activeDeckEdits.get(userId);
            if (!state || state.championId !== championId) return;
            const index = state.deck.indexOf(abilityId);
            if (index !== -1) state.deck.splice(index, 1);
            const champ = state.champion;
            const embed = buildDeckEditEmbed(champ, state.deck);
            const [availableAbilities] = await db.execute(
                `SELECT ui.item_id, a.name FROM user_inventory ui JOIN abilities a ON ui.item_id = a.id WHERE ui.user_id = ? AND a.class = ? AND ui.quantity > 0`,
                [userId, champ.class]
            );
            const addMenu = new StringSelectMenuBuilder()
                .setCustomId(`deck_add_${championId}`)
                .setPlaceholder('Add Ability')
                .addOptions(availableAbilities.map(a => ({ label: a.name, value: String(a.item_id) })).slice(0, 25));
            const removeMenu = new StringSelectMenuBuilder()
                .setCustomId(`deck_remove_${championId}`)
                .setPlaceholder('Remove Ability')
                .addOptions(Array.from(new Set(state.deck)).map(id => ({ label: allPossibleAbilities.find(ab => ab.id === id)?.name || `ID ${id}`, value: String(id) })).slice(0, 25));
            const controlsRow1 = new ActionRowBuilder().addComponents(addMenu);
            const controlsRow2 = new ActionRowBuilder().addComponents(removeMenu);
            const controlsRow3 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`deck_save_${championId}`).setLabel('Save Deck').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`deck_cancel_${championId}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
            );
            await interaction.editReply({ embeds: [embed], components: [controlsRow1, controlsRow2, controlsRow3] });
            return;
        }

        if (interaction.customId.startsWith('deck_save_')) {
            await interaction.deferUpdate();
            const championId = parseInt(interaction.customId.replace('deck_save_', ''));
            const state = activeDeckEdits.get(userId);
            if (!state || state.championId !== championId) return;
            try {
                const connection = await db.getConnection();
                try {
                    await connection.beginTransaction();
                    await connection.execute('DELETE FROM champion_decks WHERE user_champion_id = ?', [championId]);
                    for (let i = 0; i < state.deck.length; i++) {
                        await connection.execute(
                            'INSERT INTO champion_decks (user_champion_id, ability_id, order_index) VALUES (?, ?, ?)',
                            [championId, state.deck[i], i]
                        );
                    }
                    await connection.commit();
                } catch (err) {
                    await connection.rollback();
                    throw err;
                } finally {
                    connection.release();
                }
                activeDeckEdits.delete(userId);
                await interaction.editReply({ embeds: [confirmEmbed('Deck saved!')], components: [] });
            } catch (err) {
                console.error('Error saving deck:', err);
                await interaction.editReply({ content: 'Failed to save deck.', components: [] });
            }
            return;
        }

        if (interaction.customId.startsWith('deck_cancel_')) {
            await interaction.deferUpdate();
            activeDeckEdits.delete(userId);
            await interaction.editReply({ content: 'Deck editing cancelled.', components: [] });
            return;
        }
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
                    opponentName = 'Dungeon Monsters';
                    const playerTeamSize = selections.length;
                    const [monsterRows] = await db.execute(
                        'SELECT id FROM heroes WHERE is_monster = TRUE'
                    );
                    const monsterIds = monsterRows.map(r => r.id);

                    if (playerTeamSize <= 2) {
                        const monsterId = monsterIds[Math.floor(Math.random() * monsterIds.length)];
                        combatants.push(
                            createCombatant({ hero_id: monsterId, weapon_id: null, armor_id: null, ability_id: null }, 'enemy', 0)
                        );
                    } else {
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

// --- Tutorial Helper Functions ---
/**
 * Sends the hero selection step for the given champion number.
 * @param {Interaction} interaction
 * @param {string} userId
 * @param {number} champNum - 1 or 2
 */
async function sendHeroSelectionStep(interaction, userId, champNum) {
    const commonHeroes = allPossibleHeroes.filter(h => h.rarity === 'Common');
    const heroOptions = commonHeroes.map(hero => ({
        label: hero.name,
        description: `${hero.class} | HP: ${hero.hp}, ATK: ${hero.attack}`,
        value: hero.id.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`tutorial_select_hero_${champNum}`)
        .setPlaceholder(`Choose your Hero for Champion ${champNum}`)
        .addOptions(heroOptions.slice(0, 5));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.editReply({
        embeds: [simple(
            `Step 1: Choose Your Champion ${champNum}'s Hero`,
            [{ name: 'Select Your Core Hero', value: 'Heroes define your champion\'s class and base stats. Choose one to begin shaping your champion!' }]
        )],
        components: [row]
    });
    activeTutorialDrafts.get(userId).stage = 'HERO_SELECTION';
}

/**
 * Sends the ability selection step for the given champion number.
 * @param {Interaction} interaction
 * @param {string} userId
 * @param {number} champNum - 1 or 2
 */
async function sendAbilitySelectionStep(interaction, userId, champNum) {
    const userDraftState = activeTutorialDrafts.get(userId);
    const championData = champNum === 1 ? userDraftState.champion1 : userDraftState.champion2;
    const selectedHero = allPossibleHeroes.find(h => h.id === championData.heroId);
    if (!selectedHero) {
        throw new Error('Selected hero not found for ability step.');
    }

    const commonAbilities = allPossibleAbilities.filter(ab => ab.class === selectedHero.class && ab.rarity === 'Common');
    const abilityOptions = commonAbilities.map(ability => ({
        label: ability.name,
        description: `⚡ ${ability.energyCost} Energy | ${ability.effect}`,
        value: ability.id.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`tutorial_select_ability_${champNum}`)
        .setPlaceholder(`Choose a Basic Ability for Champion ${champNum}`)
        .addOptions(abilityOptions.slice(0, 5));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.editReply({
        embeds: [simple(
            `Step 2: Choose a Basic Ability for Champion ${champNum}`,
            [{ name: 'Equip a Skill', value: 'Abilities are powerful skills your champion can use in battle. Pick one that complements your hero!' }]
        )],
        components: [row]
    });
    userDraftState.stage = 'ABILITY_SELECTION';
}

/**
 * Sends the weapon selection step for the given champion number.
 * @param {Interaction} interaction
 * @param {string} userId
 * @param {number} champNum - 1 or 2
 */
async function sendWeaponSelectionStep(interaction, userId, champNum) {
    const commonWeapons = allPossibleWeapons.filter(w => w.rarity === 'Common');
    const weaponOptions = commonWeapons.map(weapon => ({
        label: weapon.name,
        description: `ATK: +${weapon.statBonuses.ATK || 0} ${weapon.ability ? '| ' + weapon.ability.name : ''}`,
        value: weapon.id.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`tutorial_select_weapon_${champNum}`)
        .setPlaceholder(`Choose a Basic Weapon for Champion ${champNum}`)
        .addOptions(weaponOptions.slice(0, 5));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.editReply({
        embeds: [simple(
            `Step 3: Choose a Basic Weapon for Champion ${champNum}`,
            [{ name: 'Arm Your Champion', value: 'Weapons augment your champion\'s attacks and can provide unique effects.' }]
        )],
        components: [row]
    });
    activeTutorialDrafts.get(userId).stage = 'WEAPON_SELECTION';
}

/**
 * Sends the armor selection step for the given champion number.
 * @param {Interaction} interaction
 * @param {string} userId
 * @param {number} champNum - 1 or 2
 */
async function sendArmorSelectionStep(interaction, userId, champNum) {
    const commonArmors = allPossibleArmors.filter(a => a.rarity === 'Common');
    const armorOptions = commonArmors.map(armor => ({
        label: armor.name,
        description: `HP: +${armor.statBonuses.HP || 0} | Block: +${armor.statBonuses.Block || 0} ${armor.ability ? '| ' + armor.ability.name : ''}`,
        value: armor.id.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`tutorial_select_armor_${champNum}`)
        .setPlaceholder(`Choose a Basic Armor for Champion ${champNum}`)
        .addOptions(armorOptions.slice(0, 5));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.editReply({
        embeds: [simple(
            `Step 4: Choose a Basic Armor for Champion ${champNum}`,
            [{ name: 'Protect Your Champion', value: 'Armor provides crucial defense, mitigating incoming damage.' }]
        )],
        components: [row]
    });
    activeTutorialDrafts.get(userId).stage = 'ARMOR_SELECTION';
}

/**
 * Displays the recap for a single champion during the tutorial.
 * @param {Interaction} interaction
 * @param {string} userId
 * @param {number} champNum - The champion number being recapped (1 or 2)
 */
async function sendChampionRecapStep(interaction, userId, champNum) {
    const userDraftState = activeTutorialDrafts.get(userId);
    const championData = champNum === 1 ? userDraftState.champion1 : userDraftState.champion2;

    const hero = allPossibleHeroes.find(h => h.id === championData.heroId);
    const ability = allPossibleAbilities.find(ab => ab.id === championData.abilityId);
    const weapon = allPossibleWeapons.find(w => w.id === championData.weaponId);
    const armor = allPossibleArmors.find(a => a.id === championData.armorId);

    const detailedInfo = await getDetailedChampionInfo({
        id: 'temp',
        base_hero_id: hero.id,
        equipped_weapon_id: weapon.id,
        equipped_armor_id: armor.id,
        equipped_ability_id: ability.id,
        level: 1
    });

    const embed = new EmbedBuilder()
        .setColor('#29b6f6')
        .setTitle(`Champion ${champNum} Assembled!`)
        .setDescription(`**${detailedInfo.name}** - the **${detailedInfo.class}**`)
        .setThumbnail(detailedInfo.imageUrl || 'https://placehold.co/100x100')
        .addFields(
            { name: 'Core Stats', value: `HP: **${detailedInfo.hp}** | ATK: **${detailedInfo.attack}** | SPD: **${detailedInfo.speed}**`, inline: false },
            { name: 'Defense', value: `Block: **${detailedInfo.block}** | Magic Resist: **${detailedInfo.magicResist}**`, inline: false },
            { name: 'Equipped Ability', value: `${ability.name} (⚡${ability.energyCost})`, inline: true },
            { name: 'Equipped Weapon', value: weapon.name, inline: true },
            { name: 'Equipped Armor', value: armor.name, inline: true },
            { name: 'Ability Effect', value: ability.effect, inline: false },
            { name: 'Weapon Bonus', value: weapon.ability ? weapon.ability.description : 'None', inline: false },
            { name: 'Armor Bonus', value: armor.ability ? armor.ability.description : 'None', inline: false }
        )
        .setTimestamp();

    let buttonLabel = '';
    let customId = '';
    let buttonStyle = ButtonStyle.Primary;

    if (champNum === 1) {
        buttonLabel = 'Draft Second Champion';
        customId = 'tutorial_recap_1_continue';
        embed.setFooter({ text: 'Next, you will draft your second champion.' });
    } else {
        buttonLabel = 'Finalize Team & Begin Adventure!';
        customId = 'tutorial_recap_2_finalize';
        buttonStyle = ButtonStyle.Success;
        embed.setFooter({ text: 'Your team is complete! Confirm to save them to your roster.' });
    }

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(customId)
                .setLabel(buttonLabel)
                .setStyle(buttonStyle)
        );

    const startOverButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tutorial_start_over')
                .setLabel('Start Over')
                .setStyle(ButtonStyle.Danger)
        );

    await interaction.editReply({ embeds: [embed], components: [actionRow, startOverButton] });
}

/**
 * Helper function to insert a single champion into the database and its equipped ability into champion_decks.
 * This function is designed to ensure the champion is created before its deck.
 * @param {string} userId - The Discord ID of the user.
 * @param {object} champData - Object containing heroId, abilityId, weaponId, armorId.
 * @returns {Promise<number>} The ID of the newly created user_champion.
 */
async function insertAndDeckChampion(userId, champData) {
    let connection;
    try {
        console.log(`[DEBUG] Attempting to insert champion for user ${userId} with data:`, champData);

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [insertResult] = await connection.execute(
            `INSERT INTO user_champions (user_id, base_hero_id, equipped_ability_id, equipped_weapon_id, equipped_armor_id, level, xp)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                champData.heroId,
                champData.abilityId,
                champData.weaponId,
                champData.armorId,
                1,
                0
            ]
        );
        const newChampionId = insertResult.insertId;
        console.log(`[DEBUG] Inserted user_champion, new ID: ${newChampionId} for user ${userId}`);

        if (champData.abilityId) {
            try {
                await connection.execute(
                    `INSERT INTO champion_decks (user_champion_id, ability_id, order_index) VALUES (?, ?, 0)`,
                    [newChampionId, champData.abilityId, 0]
                );
                console.log(`[DEBUG] Successfully inserted champion_decks entry for champion ID: ${newChampionId}`);
            } catch (deckInsertError) {
                console.error(`[ERROR] Failed to insert into champion_decks for champ ID ${newChampionId}:`, deckInsertError.message);
                throw deckInsertError;
            }
        } else {
            console.log(`[DEBUG] No ability selected for champion ID: ${newChampionId}, skipping champion_decks insert.`);
        }

        await connection.commit();
        return newChampionId;

    } catch (error) {
        if (connection) {
            console.log(`[DEBUG] Rolling back transaction for user ${userId} due to error.`);
            await connection.rollback();
        }
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

/**
 * Finalizes both champions and saves them to the database.
 * @param {Interaction} interaction
 * @param {string} userId
 */
async function finalizeChampionTeam(interaction, userId) {
    const userDraftState = activeTutorialDrafts.get(userId);
    const champion1Data = userDraftState.champion1;
    const champion2Data = userDraftState.champion2;

    try {
        await insertAndDeckChampion(userId, champion1Data);
        await insertAndDeckChampion(userId, champion2Data);

        await db.execute(
            'UPDATE users SET tutorial_completed = TRUE WHERE discord_id = ?',
            [userId]
        );

        activeTutorialDrafts.delete(userId);

        const hero1 = allPossibleHeroes.find(h => h.id === champion1Data.heroId);
        const hero2 = allPossibleHeroes.find(h => h.id === champion2Data.heroId);

        const embed = confirmEmbed(
            `Your team of **${hero1.name}** and **${hero2.name}** has been created and added to your roster!`
        );
        embed.setDescription('You\'re all set! Now you can manage your champions or jump into the Dungeon!');

        const nextStepsRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('town_barracks')
                    .setLabel('View Barracks')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚔️'),
                new ButtonBuilder()
                    .setCustomId('town_dungeon')
                    .setLabel('Enter Dungeon')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🌀')
            );

        await interaction.editReply({ embeds: [embed], components: [nextStepsRow] });

    } catch (error) {
        console.error('Error finalizing champion team:', error);
        await interaction.editReply({
            embeds: [simple('Error!', [{ name: 'Failed to create team', value: 'There was an issue saving your champions. Please try again.' }])],
            components: []
        });
        activeTutorialDrafts.delete(userId);
    }
}

/**
 * Displays the dedicated deck edit screen for a champion.
 * @param {Interaction} interaction
 * @param {string} userId
 * @param {number} championId - The ID of the champion whose deck is being edited.
 */
async function sendDeckEditScreen(interaction, userId, championId) {
    try {
        // 1. Fetch Champion's Full Details
        const [champRows] = await db.execute(
            `SELECT uc.*, h.name, h.class FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.id = ? AND uc.user_id = ?`,
            [championId, userId]
        );
        if (champRows.length === 0) {
            await interaction.editReply({ content: 'Champion not found or does not belong to you.', components: [] });
            return;
        }
        const champion = champRows[0];
        const heroData = getHeroById(champion.base_hero_id);

        // 2. Fetch Current Deck Abilities
        const [currentDeckRaw] = await db.execute(
            `SELECT cd.ability_id, a.name, a.energy_cost, a.effect
             FROM champion_decks cd JOIN abilities a ON cd.ability_id = a.id
             WHERE cd.user_champion_id = ? ORDER BY cd.order_index ASC`,
            [championId]
        );

        const currentDeckMap = new Map();
        const currentDeckDisplay = [];
        currentDeckRaw.forEach(ab => {
            currentDeckMap.set(ab.ability_id, (currentDeckMap.get(ab.ability_id) || 0) + 1);
        });

        let currentDeckSize = 0;
        for (const [id, count] of currentDeckMap.entries()) {
            const ability = allPossibleAbilities.find(a => a.id === id);
            if (ability) {
                currentDeckDisplay.push(`${ability.name} (x${count})`);
                currentDeckSize += count;
            } else {
                console.warn(`[WARN] Ability ID ${id} found in champion_decks but not in allPossibleAbilities cache!`);
            }
        }
        const currentDeckString = currentDeckDisplay.join('\n') || 'None (Deck empty)';

        // 3. Fetch Available Abilities from Inventory (matching champion's class)
        const [availableAbilitiesRaw] = await db.execute(
            `SELECT ui.item_id, ui.quantity, a.name, a.energy_cost, a.effect, a.rarity
             FROM user_inventory ui JOIN abilities a ON ui.item_id = a.id
             WHERE ui.user_id = ? AND a.class = ? AND ui.quantity > 0`,
            [userId, champion.class]
        );

        const availableAbilityOptions = [];
        availableAbilitiesRaw.forEach(ab => {
            const currentCountInDeck = currentDeckMap.get(ab.item_id) || 0;
            if (currentCountInDeck < 2) {
                availableAbilityOptions.push({
                    label: ab.name,
                    description: `⚡ ${ab.energy_cost} | ${ab.effect} (Owned: ${ab.quantity} | In Deck: ${currentCountInDeck})`,
                    value: String(ab.item_id),
                });
            }
        });

        // 4. Build the Embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`📚 Edit Deck: ${champion.name} (${champion.class})`)
            .setThumbnail(heroData?.imageUrl || null)
            .addFields(
                { name: 'Current Deck (Max 20 cards)', value: currentDeckString, inline: false },
                { name: 'Deck Size', value: `${currentDeckSize}/20 cards`, inline: true },
                { name: 'Rules', value: 'Max 2 copies of any single card.', inline: true }
            );

        // 5. Build Components
        const components = [];

        if (currentDeckSize < 20 && availableAbilityOptions.length > 0) {
            const addCardSelect = new StringSelectMenuBuilder()
                .setCustomId(`deck_add_${championId}`)
                .setPlaceholder('Add Ability to Deck')
                .addOptions(availableAbilityOptions.slice(0, 25));
            components.push(new ActionRowBuilder().addComponents(addCardSelect));
        } else if (currentDeckSize >= 20) {
            components.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('deck_full').setLabel('Deck is Full (20/20)').setStyle(ButtonStyle.Secondary).setDisabled(true)
            ));
        } else {
            components.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('no_abilities_to_add').setLabel('No Abilities to Add').setStyle(ButtonStyle.Secondary).setDisabled(true)
            ));
        }

        if (currentDeckSize > 0) {
            const removeCardOptions = currentDeckDisplay.map((cardString, index) => {
                const abilityName = cardString.split(' (x')[0];
                const ability = allPossibleAbilities.find(a => a.name === abilityName);
                return {
                    label: abilityName,
                    description: `Remove 1 copy of ${abilityName}`,
                    value: String(ability ? ability.id : `unknown_${index}`),
                };
            });

            const removeCardSelect = new StringSelectMenuBuilder()
                .setCustomId(`deck_remove_${championId}`)
                .setPlaceholder('Remove Ability from Deck')
                .addOptions(removeCardOptions.slice(0, 25));
            components.push(new ActionRowBuilder().addComponents(removeCardSelect));
        }

        const actionButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId(`deck_save_${championId}`).setLabel('Save Deck').setStyle(ButtonStyle.Success).setEmoji('💾'),
                new ButtonBuilder().setCustomId(`deck_cancel_${championId}`).setLabel('Cancel').setStyle(ButtonStyle.Danger).setEmoji('❌')
            );
        components.push(actionButtons);

        // 6. Send the reply
        await interaction.editReply({ embeds: [embed], components });
    } catch (error) {
        console.error(`[CRITICAL ERROR] sendDeckEditScreen failed for championId ${championId}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Failed to open deck editor due to an unexpected error.', ephemeral: true });
        } else {
            await interaction.editReply({ content: 'Failed to open deck editor due to an unexpected error. Check bot console for details.', components: [] });
        }
    }
}

function buildDeckEditEmbed(champion, deck) {
    const counts = {};
    for (const id of deck) {
        counts[id] = (counts[id] || 0) + 1;
    }
    const deckList = Object.entries(counts).map(([id, c]) => {
        const name = allPossibleAbilities.find(ab => ab.id === parseInt(id))?.name || `ID ${id}`;
        return `${name} (x${c})`;
    }).join(', ');
    return new EmbedBuilder()
        .setColor('#29b6f6')
        .setTitle(`Editing Deck: ${champion.name}`)
        .addFields(
            { name: 'Deck', value: deckList || 'Empty', inline: false },
            { name: 'Deck Size', value: `${deck.length}/20 cards`, inline: true },
            { name: 'Rules', value: 'Max 20 cards, 2x per card', inline: true }
        );
}


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
