const { MessageFlags } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const ANNOUNCEMENTS_ID = process.env.ANNOUNCEMENT_CHANNEL_ID;
let announcementsChannel;
const db = require('./util/database');
const { simple } = require('./src/utils/embedBuilder');
const confirmEmbed = require('./src/utils/confirm');
const { generateCardImage, generatePackImage, generateSealedBoosterImage } = require('./src/utils/cardRenderer');
const { setTimeout: sleep } = require('node:timers/promises');
const {
  allPossibleHeroes,
  allPossibleWeapons,
  allPossibleArmors,
  allPossibleAbilities
} = require('../backend/game/data');
const { loadAllData, gameData, getHeroes, getHeroById, getMonsters, getRandomCardsForPack } = require('./util/gameData');
const { createCombatant } = require('../backend/game/utils');
const GameEngine = require('../backend/game/engine');
const { getTownMenu } = require('./commands/town.js');
const marketManager = require('./features/marketManager');
const tutorialManager = require('./features/tutorialManager');

const { BOOSTER_PACKS } = require('./src/boosterConfig');

// XP needed to reach the NEXT level (Level 10 is max)
const LEVEL_UP_THRESHOLDS = {
    1: 60, 2: 70, 3: 80, 4: 90, 5: 100,
    6: 110, 7: 120, 8: 130, 9: 140
};


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

// In-memory map to track active deck edits
// Key: userId, Value: { championId: number, deck: number[] }
const activeDeckEdits = new Map();
// Temporary storage for opened packs awaiting card selection
const userTemporaryPacks = new Map();

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

    announcementsChannel = client.channels.cache.get(ANNOUNCEMENTS_ID);

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

// Helper to apply level up if XP threshold reached
async function checkAndApplyLevelUp(userId, championId, interaction) {
    const [rows] = await db.execute('SELECT level, xp FROM user_champions WHERE id = ?', [championId]);
    if (rows.length === 0) return;

    let { level, xp } = rows[0];
    const xpNeeded = LEVEL_UP_THRESHOLDS[level];

    if (xpNeeded && xp >= xpNeeded) {
        const newLevel = level + 1;
        const remainingXp = xp - xpNeeded;
        await db.execute('UPDATE user_champions SET level = ?, xp = ? WHERE id = ?', [newLevel, remainingXp, championId]);

        const [[heroRow]] = await db.execute('SELECT base_hero_id FROM user_champions WHERE id = ?', [championId]);
        const hero = getHeroById(heroRow.base_hero_id);
        await interaction.followUp({
            embeds: [simple('🌟 Level Up! 🌟', [{ name: hero.name, value: `has reached Level ${newLevel}!` }])],
            flags: [MessageFlags.Ephemeral]
        });
    }
}
// --- END NEW HELPER FUNCTION ---




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
                    await interaction.reply({ content: 'You need at least one champion in your roster to set a defense team.', flags: [MessageFlags.Ephemeral] });
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
                await interaction.reply({ content: 'Choose your defense team!', components: [row], flags: [MessageFlags.Ephemeral] });
            } catch (error) {
                console.error('Error preparing defense team selection:', error);
                if (!interaction.replied) {
                    await interaction.reply({ content: 'An error occurred while preparing your defense team.', flags: [MessageFlags.Ephemeral] });
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
                        await interaction.reply({ content: 'Champion not found.', flags: [MessageFlags.Ephemeral] });
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

                    await interaction.reply({ embeds: [embed], components, flags: [MessageFlags.Ephemeral] });

                } catch (err) {
                    console.error('Error preparing champion management:', err);
                    if (!interaction.replied) {
                        await interaction.reply({ content: 'An error occurred while preparing this menu.', flags: [MessageFlags.Ephemeral] });
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
            const replyOptions = { content: 'There was an error executing this command!', flags: [MessageFlags.Ephemeral] };
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
        let userDraftState = tutorialManager.activeTutorialDrafts.get(userId);
        if (interaction.customId.startsWith('tutorial_') || userDraftState) {
            try {
                await interaction.deferUpdate();
                switch (interaction.customId) {
                    case 'tutorial_start_new_flow':
                        if (!userDraftState) {
                            userDraftState = {
                                stage: 'NEW_FLOW_INITIAL_GREETING',
                                champion1: {},
                                champion2: {},
                                receivedWelcomePack: false,
                                initialGoldGranted: false,
                                currentChampNum: 1
                            };
                            tutorialManager.activeTutorialDrafts.set(userId, userDraftState);
                        }

                        if (!userDraftState.receivedWelcomePack) {
                            await tutorialManager.sendWelcomePackStep(interaction, userId);
                            userDraftState.receivedWelcomePack = true;
                            userDraftState.stage = 'WELCOME_PACK_OPENED';
                        } else {
                            await tutorialManager.sendInitialGoldAndBoosterStore(interaction, userId);
                        }
                        break;
                    case 'tutorial_open_welcome_pack':
                        if (userDraftState.stage === 'WELCOME_PACK_OPENED') {
                            await tutorialManager.openWelcomePackAndGrantGold(interaction, userId);
                            userDraftState.stage = 'GOLD_GRANTED_AND_STORE_OPENED';
                            userDraftState.initialGoldGranted = true;
                        } else {
                            await interaction.editReply({ content: 'You already opened your welcome pack!', components: [] });
                        }
                        break;
                    case 'tutorial_confirm_tutorial_completion':
                        await tutorialManager.finalizeTutorialCompletion(interaction, userId);
                        break;
                    case 'tutorial_start_draft': // Initial button to start Champion 1 draft
                        userDraftState.stage = 'HERO_SELECTION';
                        await tutorialManager.sendHeroSelectionStep(interaction, userId, userDraftState.currentChampNum);
                        break;
                    case 'tutorial_recap_1_continue':
                        userDraftState.currentChampNum = 2;
                        userDraftState.stage = 'HERO_SELECTION';
                        await tutorialManager.sendHeroSelectionStep(interaction, userId, userDraftState.currentChampNum);
                        break;
                    case 'tutorial_recap_2_finalize':
                        await tutorialManager.finalizeChampionTeam(interaction, userId);
                        break;
                    case 'tutorial_start_over':
                        tutorialManager.activeTutorialDrafts.delete(userId);
                        await interaction.editReply({
                            embeds: [simple('Draft Reset', [{ name: 'Starting Over!', value: 'Your champion draft has been reset. Use `/start` to begin again.' }])],
                            components: []
                        });
                        break;
                    default:
                        console.log(`Unhandled tutorial interaction: ${interaction.customId}`);
                        await interaction.editReply({ content: 'Something went wrong with the tutorial step. Please try `/start` again.', components: [] });
                        tutorialManager.activeTutorialDrafts.delete(userId);
                }
            } catch (error) {
                console.error(`Error handling tutorial step ${interaction.customId}:`, error);
                await interaction.editReply({ content: 'An error occurred during the tutorial. Please try `/start` again.', components: [] });
                tutorialManager.activeTutorialDrafts.delete(userId);
            }
            return;
        }
        try {
            switch (interaction.customId) {
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
                            new ButtonBuilder().setCustomId('manage_champions_selection').setLabel('Manage Champions').setStyle(ButtonStyle.Primary).setEmoji('⚙️'),
                            new ButtonBuilder().setCustomId('show_packs_to_open').setLabel('Open Booster Packs 📦').setStyle(ButtonStyle.Success)
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
                        // Create a button to allow the user to go back
                        const backButton = new ButtonBuilder()
                            .setCustomId('back_to_barracks')
                            .setLabel('Back to Barracks')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⬅️');

                        const row = new ActionRowBuilder().addComponents(backButton);

                        // Update the reply to include the button
                        await interaction.editReply({
                            content: 'You have no champions to manage!',
                            components: [row]
                        });
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
                    const navigationRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_to_barracks').setLabel('Back to Barracks').setStyle(ButtonStyle.Secondary).setEmoji('⬅️'),
                            new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('🏠')
                        );

                    await interaction.editReply({
                        embeds: [simple('Manage Your Champions', [{ name: 'Choose a Champion', value: 'Select a champion to view their details and modify their deck.' }])],
                        components: [row, navigationRow]
                    });
                    break;
                }
                case 'show_packs_to_open': {
                    await interaction.deferUpdate();
                    const userId = interaction.user.id;
                    const [rows] = await db.execute(
                        'SELECT basic_hero_packs, standard_ability_packs, premium_weapon_packs, basic_armor_packs FROM users WHERE discord_id = ?',
                        [userId]
                    );
                    const packs = rows[0] || {};

                    const embed = new EmbedBuilder()
                        .setColor('#f97316')
                        .setTitle('Your Booster Packs')
                        .setDescription(`Hero Packs: ${packs.basic_hero_packs || 0}\nAbility Packs: ${packs.standard_ability_packs || 0}\nWeapon Packs: ${packs.premium_weapon_packs || 0}\nArmor Packs: ${packs.basic_armor_packs || 0}`);

                    const buttons = [];
                    if (packs.basic_hero_packs > 0) {
                        buttons.push(new ButtonBuilder().setCustomId('open_specific_pack_hero').setLabel('Open Hero Pack').setStyle(ButtonStyle.Primary));
                    }
                    if (packs.standard_ability_packs > 0) {
                        buttons.push(new ButtonBuilder().setCustomId('open_specific_pack_ability').setLabel('Open Ability Pack').setStyle(ButtonStyle.Primary));
                    }
                    if (packs.premium_weapon_packs > 0) {
                        buttons.push(new ButtonBuilder().setCustomId('open_specific_pack_weapon').setLabel('Open Weapon Pack').setStyle(ButtonStyle.Primary));
                    }
                    if (packs.basic_armor_packs > 0) {
                        buttons.push(new ButtonBuilder().setCustomId('open_specific_pack_armor').setLabel('Open Armor Pack').setStyle(ButtonStyle.Primary));
                    }

                    const packRow = new ActionRowBuilder().addComponents(buttons);
                    const navRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('back_to_barracks').setLabel('Back to Barracks').setStyle(ButtonStyle.Secondary)
                    );

                    await interaction.editReply({ embeds: [embed], components: [packRow, navRow] });
                    break;
                }
                case 'open_specific_pack_hero':
                case 'open_specific_pack_ability':
                case 'open_specific_pack_weapon':
                case 'open_specific_pack_armor': {
                    await interaction.deferUpdate();
                    const userId = interaction.user.id;
                    const packType = interaction.customId.replace('open_specific_pack_', '');

                    const columnMap = {
                        hero: 'basic_hero_packs',
                        ability: 'standard_ability_packs',
                        weapon: 'premium_weapon_packs',
                        armor: 'basic_armor_packs'
                    };

                    const columnName = columnMap[packType];
                    if (!columnName) {
                        await interaction.editReply({ content: 'Invalid pack type.', components: [] });
                        return;
                    }

                    await db.execute(`UPDATE users SET ${columnName} = ${columnName} - 1 WHERE discord_id = ? AND ${columnName} > 0`, [userId]);

                    const recruitCard = allPossibleHeroes.find(h => h.id === 101);
                    const cards = [recruitCard, recruitCard, recruitCard];
                    userTemporaryPacks.set(userId, cards);

                    const boosterBuffer = await generateSealedBoosterImage();
                    const openRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('reveal_pack_cards').setLabel('Tear it Open!').setStyle(ButtonStyle.Primary)
                    );

                    await interaction.editReply({ content: '', files: [{ attachment: boosterBuffer, name: 'booster.png' }], components: [openRow] });
                    break;
                }
                case 'reveal_pack_cards': {
                    await interaction.deferUpdate();
                    const userId = interaction.user.id;
                    const cards = userTemporaryPacks.get(userId);
                    if (!cards) {
                        await interaction.editReply({ content: 'No pack data found.', components: [] });
                        return;
                    }
                    await interaction.editReply({ content: 'Ripping open the pack...', components: [] });
                    await sleep(1200);
                    const packImage = await generatePackImage(cards);
                    const chooseRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('select_card_0_from_pack').setLabel(`Choose ${cards[0].name}`).setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('select_card_1_from_pack').setLabel(`Choose ${cards[1].name}`).setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('select_card_2_from_pack').setLabel(`Choose ${cards[2].name}`).setStyle(ButtonStyle.Primary)
                    );
                    await interaction.editReply({ content: '', files: [{ attachment: packImage, name: 'pack.png' }], components: [chooseRow] });
                    break;
                }
                case 'select_card_0_from_pack':
                case 'select_card_1_from_pack':
                case 'select_card_2_from_pack': {
                    await interaction.deferUpdate();
                    const userId = interaction.user.id;
                    const cards = userTemporaryPacks.get(userId);
                    if (!cards) {
                        await interaction.editReply({ content: 'No pack data found.', components: [] });
                        return;
                    }
                    const index = parseInt(interaction.customId.replace('select_card_', '').replace('_from_pack', ''));
                    const chosenCard = cards[index];
                    const unchosen = cards.filter((_, i) => i !== index);

                    try {
                        await db.execute(
                            `INSERT INTO user_inventory (user_id, item_id, quantity, item_type) VALUES (?, ?, 1, ?) ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
                            [userId, chosenCard.id, chosenCard.type]
                        );
                    } catch (err) {
                        console.error('Error saving chosen card:', err);
                    }

                    const rarityShards = { Common: 1, Uncommon: 3, Rare: 5, Epic: 10 };
                    const totalShardsGained = unchosen.reduce((sum, c) => sum + (rarityShards[c.rarity] || 0), 0);
                    await db.execute('UPDATE users SET summoning_shards = summoning_shards + ? WHERE discord_id = ?', [totalShardsGained, userId]);

                    userTemporaryPacks.delete(userId);

                    const user = await client.users.fetch(userId);
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#84cc16')
                        .setTitle('Your New Card!')
                        .setDescription(`You chose **${chosenCard.name}**! You gained **${totalShardsGained}** shards from the other cards.`)
                        .setFooter({ text: 'Auto-Battler Bot' });
                    let cardBuffer = null;
                    try {
                        cardBuffer = await generateCardImage(chosenCard);
                    } catch (err) {
                        console.error(`Failed to generate image for ${chosenCard.name}:`, err);
                    }
                    console.log(`DMing chosen card ${chosenCard.name} to user ${user.username} (${userId})`);
                    try {
                        const files = cardBuffer ? [{ attachment: cardBuffer, name: `${chosenCard.name}.png` }] : [];
                        await user.send({ embeds: [dmEmbed], files });
                    } catch (e) {
                        console.error('Failed to send DM:', e);
                    }

                    await interaction.editReply({ content: 'Card chosen and added to your inventory!', components: [] });
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
                            new ButtonBuilder().setCustomId('manage_champions_selection').setLabel('Manage Champions').setStyle(ButtonStyle.Primary).setEmoji('⚙️'),
                            new ButtonBuilder().setCustomId('show_packs_to_open').setLabel('Open Booster Packs 📦').setStyle(ButtonStyle.Success)
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
                        await interaction.reply({ content: 'You need at least 2 champions in your roster to fight! Use `/summon` to recruit more.', flags: [MessageFlags.Ephemeral] });
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
                    const backToTownRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
                        );
                    await interaction.reply({ content: 'Choose your team for the dungeon fight!', components: [row, backToTownRow], flags: [MessageFlags.Ephemeral] });
                    break;
                }
                case 'town_forge': {
                    await interaction.reply({ content: "The Forge is not yet open. Check back later!", flags: [MessageFlags.Ephemeral] });
                    break;
                }
                case 'town_craft':
                    await interaction.reply({ content: 'This feature is coming soon!', flags: [MessageFlags.Ephemeral] });
                    break;
                case 'town_market': {
                    await interaction.deferUpdate();

                    const marketEmbed = simple(
                        '💰 The Grand Bazaar',
                        [{ name: 'Welcome to the Marketplace!', value: 'Here you can buy various goods for your journey.' }]
                    );

                    const shopButtons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('market_tavern').setLabel('The Tavern').setStyle(ButtonStyle.Primary).setEmoji('🍻'),
                            new ButtonBuilder().setCustomId('market_armory').setLabel('The Armory').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                            new ButtonBuilder().setCustomId('market_altar').setLabel('The Altar').setStyle(ButtonStyle.Danger).setEmoji('💀')
                        );
                    const navigationRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
                        );

                    await interaction.editReply({ embeds: [marketEmbed], components: [shopButtons, navigationRow] });
                    break;
                }


                case 'view_inventory_from_pack': {
                    await interaction.deferUpdate();
                    const inventoryCommand = client.commands.get('inventory');
                    if (inventoryCommand) {
                        await inventoryCommand.execute(interaction);
                    } else {
                        await interaction.editReply({ content: 'Inventory command not found.', flags: [MessageFlags.Ephemeral] });
                    }
                    break;
                }
                case 'back_to_town': {
                    await interaction.update(getTownMenu());
                    break;
                }
                case 'manage_champions': {
                    await interaction.reply({ content: 'Champion management is coming soon!', flags: [MessageFlags.Ephemeral] });
                    break;
                }
                default:
                    break;
            }
        } catch (err) {
            console.error('Error handling button interaction:', err);
            if (!interaction.replied) {
                await interaction.reply({ content: 'An error occurred while processing this interaction.', flags: [MessageFlags.Ephemeral] });
            }
        }
        return;
    }

    // --- Selection Menu Handler ---
    if (interaction.isStringSelectMenu()) {
        const userId = interaction.user.id;
        const userDraftState = tutorialManager.activeTutorialDrafts.get(userId);
        if (interaction.customId.startsWith('market_pack_select_')) {
            await interaction.deferUpdate();
            const parts = interaction.customId.split('_');
            const category = parts[3];
            const page = parseInt(parts[4], 10) || 0;
            const packId = interaction.values[0];
            await marketManager.handleBoosterPurchase(interaction, userId, packId, page);
            return;
        }
        if (interaction.customId === 'begin_class_select') {
            await interaction.deferUpdate();
            const chosen = interaction.values[0];
            await require('./features/beginManager').handleClassSelected(interaction, userId, chosen);
            return;
        }
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
                        await tutorialManager.sendAbilitySelectionStep(interaction, userId, champNum);
                        break;
                    case `tutorial_select_ability_${champNum}`:
                        currentChampionData.abilityId = parseInt(interaction.values[0]);
                        userDraftState.stage = 'WEAPON_SELECTION';
                        await tutorialManager.sendWeaponSelectionStep(interaction, userId, champNum);
                        break;
                    case `tutorial_select_weapon_${champNum}`:
                        currentChampionData.weaponId = parseInt(interaction.values[0]);
                        userDraftState.stage = 'ARMOR_SELECTION';
                        await tutorialManager.sendArmorSelectionStep(interaction, userId, champNum);
                        break;
                    case `tutorial_select_armor_${champNum}`:
                        currentChampionData.armorId = parseInt(interaction.values[0]);
                        if (userDraftState.currentChampNum === 1) {
                            userDraftState.stage = 'RECAP_1';
                            await tutorialManager.sendChampionRecapStep(interaction, userId, userDraftState.currentChampNum);
                        } else {
                            userDraftState.stage = 'RECAP_2';
                            await tutorialManager.sendChampionRecapStep(interaction, userId, userDraftState.currentChampNum);
                        }
                        break;
                    default:
                        console.log(`Unhandled tutorial interaction (select menu): ${interaction.customId}`);
                        await interaction.editReply({ content: 'Something went wrong with the tutorial step. Please try `/start` again.', components: [] });
                        tutorialManager.activeTutorialDrafts.delete(userId);
                }
            } catch (error) {
                console.error(`Error handling tutorial select menu ${interaction.customId}:`, error);
                await interaction.editReply({ content: 'An error occurred during the tutorial. Please try `/start` again.', components: [] });
                tutorialManager.activeTutorialDrafts.delete(userId);
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
                    new ButtonBuilder().setCustomId('back_to_barracks_from_champ').setLabel('Back to Roster').setStyle(ButtonStyle.Secondary).setEmoji('⬅️'),
                    new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('🏠')
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

            const countInDeck = state.deck.filter(id => id === abilityId).length;

            if (state.deck.length >= 20) {
                await interaction.followUp({ content: 'Your deck is full (20/20 cards). Remove a card to add another.', flags: [MessageFlags.Ephemeral] });
                return;
            }
            if (countInDeck >= 2) {
                await interaction.followUp({ content: 'You can only have a maximum of 2 copies of the same card.', flags: [MessageFlags.Ephemeral] });
                return;
            }

            state.deck.push(abilityId);
            await sendDeckEditScreen(interaction, userId, championId, true);
            return;
        }

        if (interaction.customId.startsWith('deck_remove_')) {
            await interaction.deferUpdate();
            const championId = parseInt(interaction.customId.replace('deck_remove_', ''));
            const abilityId = parseInt(interaction.values[0]);

            const state = activeDeckEdits.get(userId);
            if (!state || state.championId !== championId) return;

            const indexToRemove = state.deck.indexOf(abilityId);
            if (indexToRemove > -1) {
                state.deck.splice(indexToRemove, 1);
            }

            await sendDeckEditScreen(interaction, userId, championId, true);
            return;
        }

        if (interaction.customId.startsWith('deck_save_')) {
            await interaction.deferUpdate();
            const championId = parseInt(interaction.customId.replace('deck_save_', ''));

            const state = activeDeckEdits.get(userId);
            if (!state || state.championId !== championId) return;

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
                activeDeckEdits.delete(userId);
                await interaction.editReply({ embeds: [confirmEmbed('Your deck has been saved!')], components: [] });
            } catch (err) {
                await connection.rollback();
                console.error('Error saving deck:', err);
                await interaction.editReply({ content: 'Failed to save your deck due to a database error.', components: [] });
            } finally {
                connection.release();
            }
            return;
        }

        if (interaction.customId.startsWith('deck_cancel_')) {
            await interaction.deferUpdate();
            activeDeckEdits.delete(userId);
            await interaction.editReply({ content: 'Deck editing cancelled. No changes were saved.', components: [] });
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

                const [deckRows1] = await db.execute(
                    'SELECT ability_id FROM champion_decks WHERE user_champion_id = ? ORDER BY order_index ASC',
                    [playerChampion1_db.id]
                );
                const deckAbilityIds1 = deckRows1.map(r => r.ability_id);

                let deckAbilityIds2 = [];
                if (playerChampion2_db) {
                    const [dr2] = await db.execute(
                        'SELECT ability_id FROM champion_decks WHERE user_champion_id = ? ORDER BY order_index ASC',
                        [playerChampion2_db.id]
                    );
                    deckAbilityIds2 = dr2.map(r => r.ability_id);
                }

                let isPvP = Math.random() < 0.25;
                let opponentName = 'Dungeon Monsters';
                const combatants = [
                    createCombatant({ hero_id: playerChampion1_db.base_hero_id, weapon_id: playerChampion1_db.equipped_weapon_id, armor_id: playerChampion1_db.equipped_armor_id, ability_id: playerChampion1_db.equipped_ability_id, deck: deckAbilityIds1 }, 'player', 0),
                    playerChampion2_db ? createCombatant({ hero_id: playerChampion2_db.base_hero_id, weapon_id: playerChampion2_db.equipped_weapon_id, armor_id: playerChampion2_db.equipped_armor_id, ability_id: playerChampion2_db.equipped_ability_id, deck: deckAbilityIds2 }, 'player', 1) : null,
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

                        const [ed1] = await db.execute(
                            'SELECT ability_id FROM champion_decks WHERE user_champion_id = ? ORDER BY order_index ASC',
                            [enemy1_db.id]
                        );
                        const enemyDeck1 = ed1.map(r => r.ability_id);
                        combatants.push(
                            createCombatant({ hero_id: enemy1_db.base_hero_id, weapon_id: enemy1_db.equipped_weapon_id, armor_id: enemy1_db.equipped_armor_id, ability_id: enemy1_db.equipped_ability_id, deck: enemyDeck1 }, 'enemy', 0)
                        );
                        if (enemy2_db) {
                            const [ed2] = await db.execute(
                                'SELECT ability_id FROM champion_decks WHERE user_champion_id = ? ORDER BY order_index ASC',
                                [enemy2_db.id]
                            );
                            const enemyDeck2 = ed2.map(r => r.ability_id);
                            combatants.push(
                                createCombatant({ hero_id: enemy2_db.base_hero_id, weapon_id: enemy2_db.equipped_weapon_id, armor_id: enemy2_db.equipped_armor_id, ability_id: enemy2_db.equipped_ability_id, deck: enemyDeck2 }, 'enemy', 1)
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
                            await checkAndApplyLevelUp(interaction.user.id, champDb.id, interaction);
                        }
                    }
                    const gold = Math.floor(Math.random() * 51) + 50;
                    await db.execute('UPDATE users SET soft_currency = soft_currency + ? WHERE discord_id = ?', [gold, interaction.user.id]);
                    resultFields.push({ name: 'Rewards', value: `${xpGain} XP to surviving champions\n${gold} Gold` });
                } else {
                    resultFields.push({ name: 'Defeat', value: 'You were vanquished by the dungeon foes.' });
                }

                await interaction.followUp({ embeds: [simple('⚔️ Battle Complete! ⚔️', resultFields)], flags: [MessageFlags.Ephemeral] });

                const logChunks = chunkBattleLog(battleLog);
                for (const chunk of logChunks) {
                    await interaction.followUp({ content: `\`\`\`${chunk}\`\`\``, flags: [MessageFlags.Ephemeral] });
                }

            } catch (error) {
                console.error('Error handling fight selection:', error);
                await interaction.followUp({ content: 'An error occurred while starting the battle.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
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
