const { InteractionResponseFlags } = require('discord-api-types/v10');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const confirmEmbed = require('../src/utils/confirm');
const { simple } = require('../src/utils/embedBuilder');
const db = require('../util/database');
const { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } = require('../../backend/game/data');
const { getHeroes, getHeroById } = require('../util/gameData');

const STARTING_GOLD = 400;
const activeTutorialDrafts = new Map();

async function getDetailedChampionInfo(championDbData) {
    const hero = getHeroes().find(h => h.id === championDbData.base_hero_id);
    const weapon = allPossibleWeapons.find(w => w.id === championDbData.equipped_weapon_id);
    const armor = allPossibleArmors.find(a => a.id === championDbData.equipped_armor_id);
    if (!hero) {
        return { name: `Unknown Hero (ID: ${championDbData.base_hero_id})`, stats: 'N/A', deck: 'N/A', rarity: 'Unknown', class: 'Unknown', level: championDbData.level };
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
    const deckInfo = deckAbilities.length > 0 ? deckAbilities.map(ab => ab.name).join(', ') : 'None (Manage to create a deck)';
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
        embeds: [simple(`Step 1: Choose Your Champion ${champNum}'s Hero`, [{ name: 'Select Your Core Hero', value: 'Heroes define your champion\'s class and base stats. Choose one to begin shaping your champion!' }])],
        components: [row]
    });
    activeTutorialDrafts.get(userId).stage = 'HERO_SELECTION';
}

async function sendAbilitySelectionStep(interaction, userId, champNum) {
    const userDraftState = activeTutorialDrafts.get(userId);
    const championData = champNum === 1 ? userDraftState.champion1 : userDraftState.champion2;
    const selectedHero = allPossibleHeroes.find(h => h.id === championData.heroId);
    if (!selectedHero) throw new Error('Selected hero not found for ability step.');
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
        embeds: [simple(`Step 2: Choose a Basic Ability for Champion ${champNum}`, [{ name: 'Equip a Skill', value: 'Abilities are powerful skills your champion can use in battle. Pick one that complements your hero!' }])],
        components: [row]
    });
    userDraftState.stage = 'ABILITY_SELECTION';
}

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
        embeds: [simple(`Step 3: Choose a Basic Weapon for Champion ${champNum}`, [{ name: 'Arm Your Champion', value: 'Weapons augment your champion\'s attacks and can provide unique effects.' }])],
        components: [row]
    });
    activeTutorialDrafts.get(userId).stage = 'WEAPON_SELECTION';
}

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
        embeds: [simple(`Step 4: Choose a Basic Armor for Champion ${champNum}`, [{ name: 'Protect Your Champion', value: 'Armor provides crucial defense, mitigating incoming damage.' }])],
        components: [row]
    });
    activeTutorialDrafts.get(userId).stage = 'ARMOR_SELECTION';
}

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
    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(customId).setLabel(buttonLabel).setStyle(buttonStyle)
    );
    const startOverButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tutorial_start_over').setLabel('Start Over').setStyle(ButtonStyle.Danger)
    );
    await interaction.editReply({ embeds: [embed], components: [actionRow, startOverButton] });
}

async function insertAndDeckChampion(userId, champData) {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        const [insertResult] = await connection.execute(
            `INSERT INTO user_champions (user_id, base_hero_id, equipped_ability_id, equipped_weapon_id, equipped_armor_id, level, xp) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, champData.heroId, champData.abilityId, champData.weaponId, champData.armorId, 1, 0]
        );
        const newChampionId = insertResult.insertId;
        if (champData.abilityId) {
            await connection.execute(
                `INSERT INTO champion_decks (user_champion_id, ability_id, order_index) VALUES (?, ?, 0)`,
                [newChampionId, champData.abilityId, 0]
            );
        }
        await connection.commit();
        return newChampionId;
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

async function finalizeChampionTeam(interaction, userId) {
    const userDraftState = activeTutorialDrafts.get(userId);
    const champion1Data = userDraftState.champion1;
    const champion2Data = userDraftState.champion2;
    try {
        await insertAndDeckChampion(userId, champion1Data);
        await insertAndDeckChampion(userId, champion2Data);
        await db.execute('UPDATE users SET tutorial_completed = TRUE WHERE discord_id = ?', [userId]);
        activeTutorialDrafts.delete(userId);
        const hero1 = allPossibleHeroes.find(h => h.id === champion1Data.heroId);
        const hero2 = allPossibleHeroes.find(h => h.id === champion2Data.heroId);
        const embed = confirmEmbed(`Your team of **${hero1.name}** and **${hero2.name}** has been created and added to your roster!`);
        embed.setDescription('You\'re all set! Now you can manage your champions or jump into the Dungeon!');
        const nextStepsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('town_barracks').setLabel('View Barracks').setStyle(ButtonStyle.Secondary).setEmoji('⚔️'),
            new ButtonBuilder().setCustomId('town_dungeon').setLabel('Enter Dungeon').setStyle(ButtonStyle.Primary).setEmoji('🌀')
        );
        await interaction.editReply({ embeds: [embed], components: [nextStepsRow] });
    } catch (error) {
        console.error('Error finalizing champion team:', error);
        await interaction.editReply({ embeds: [simple('Error!', [{ name: 'Failed to create team', value: 'There was an issue saving your champions. Please try again.' }])], components: [] });
        activeTutorialDrafts.delete(userId);
    }
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

async function generateRandomChampionKit() {
    const commonHeroes = allPossibleHeroes.filter(h => h.rarity === 'Common' && !h.is_monster);
    const hero = commonHeroes[Math.floor(Math.random() * commonHeroes.length)];
    const abilityPool = allPossibleAbilities.filter(a => a.class === hero.class && a.rarity === 'Common');
    const ability = abilityPool.length ? abilityPool[Math.floor(Math.random() * abilityPool.length)] : null;
    const commonWeapons = allPossibleWeapons.filter(w => w.rarity === 'Common');
    const weapon = commonWeapons[Math.floor(Math.random() * commonWeapons.length)];
    const commonArmors = allPossibleArmors.filter(a => a.rarity === 'Common');
    const armor = commonArmors[Math.floor(Math.random() * commonArmors.length)];
    return { heroId: hero.id, abilityId: ability ? ability.id : null, weaponId: weapon.id, armorId: armor.id, heroData: hero, abilityData: ability, weaponData: weapon, armorData: armor };
}

async function sendWelcomePackStep(interaction, userId) {
    const embed = simple('📦 Your Welcome Pack Awaits!', [{ name: 'Special Delivery!', value: 'As a new adventurer, you receive a complimentary "Heroic Beginnings" Booster Pack. It contains two common champions, ready for battle!' }]);
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tutorial_open_welcome_pack').setLabel('Open "Heroic Beginnings" Pack').setStyle(ButtonStyle.Primary).setEmoji('✨')
    );
    await interaction.editReply({ embeds: [embed], components: [row] });
}

async function openWelcomePackAndGrantGold(interaction, userId) {
    const userDraftState = activeTutorialDrafts.get(userId);
    const champion1Kit = await generateRandomChampionKit();
    let champion2Kit = await generateRandomChampionKit();
    while (champion2Kit.heroId === champion1Kit.heroId && allPossibleHeroes.length > 1) {
        champion2Kit = await generateRandomChampionKit();
    }
    userDraftState.champion1 = champion1Kit;
    userDraftState.champion2 = champion2Kit;
    const names = [];
    try {
        await insertAndDeckChampion(userId, champion1Kit);
        await insertAndDeckChampion(userId, champion2Kit);
        names.push(`**${champion1Kit.heroData.name}** (Common) - Equipped`);
        names.push(`**${champion2Kit.heroData.name}** (Common) - Equipped`);
    } catch (error) {
        console.error('Error inserting welcome pack champions:', error);
        await interaction.editReply({ content: 'Failed to create your starting champions due to a database error. Please try `/start` again.', components: [] });
        activeTutorialDrafts.delete(userId);
        return;
    }
    try {
        await db.execute('UPDATE users SET soft_currency = soft_currency + ? WHERE discord_id = ?', [STARTING_GOLD, userId]);
    } catch (error) {
        console.error('Error granting initial gold:', error);
    }
    const resultsEmbed = new EmbedBuilder()
        .setColor('#84cc16')
        .setTitle('🎉 Heroic Beginnings Pack Opened! 🎉')
        .setDescription(`You received two powerful champions and ${STARTING_GOLD} Gold to get started!`)
        .addFields({ name: 'New Champions:', value: names.join('\n'), inline: false }, { name: 'Starting Gold:', value: `🪙 ${STARTING_GOLD}`, inline: true })
        .setFooter({ text: 'Time to expand your collection!' })
        .setTimestamp();
    await interaction.editReply({ embeds: [resultsEmbed] });
    await sendInitialGoldAndBoosterStore(interaction, userId);
}

async function sendInitialGoldAndBoosterStore(interaction, userId) {
    const storeEmbed = simple('🛍️ Your First Shopping Spree!', [{ name: 'Available Packs', value: `Use your ${STARTING_GOLD} Gold to buy more packs and strengthen your roster!` }]);
    const packButtons = Object.entries(require('./marketManager').BOOSTER_PACKS).map(([packId, packInfo]) =>
        new ButtonBuilder().setCustomId(`buy_pack_${packId}`).setLabel(`${packInfo.name} (${packInfo.cost} Gold 🪙)`).setStyle(ButtonStyle.Primary).setEmoji('🛒')
    );
    const components = [];
    for (let i = 0; i < packButtons.length; i += 5) {
        components.push(new ActionRowBuilder().addComponents(packButtons.slice(i, i + 5)));
    }
    const finalizeTutorialRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tutorial_confirm_tutorial_completion').setLabel('Done Training - Begin Dungeon!').setStyle(ButtonStyle.Success).setEmoji('✅')
    );
    components.push(finalizeTutorialRow);
    await interaction.followUp({ embeds: [storeEmbed], components, flags: [InteractionResponseFlags.EPHEMERAL] });
}

async function finalizeTutorialCompletion(interaction, userId) {
    try {
        await db.execute('UPDATE users SET tutorial_completed = TRUE WHERE discord_id = ?', [userId]);
        activeTutorialDrafts.delete(userId);
        const embed = confirmEmbed('Training Complete!');
        embed.addFields({ name: 'Your Adventure Awaits!', value: 'You are now ready to face the dangers of the dungeon. Good luck, adventurer!' });
        const nextStepsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('town_barracks').setLabel('View Barracks').setStyle(ButtonStyle.Secondary).setEmoji('⚔️'),
            new ButtonBuilder().setCustomId('town_dungeon').setLabel('Enter Dungeon').setStyle(ButtonStyle.Primary).setEmoji('🌀')
        );
        await interaction.editReply({ embeds: [embed], components: [nextStepsRow] });
    } catch (error) {
        console.error('Error finalizing tutorial completion:', error);
        await interaction.editReply({ content: 'Failed to mark tutorial as complete due to an error. Please try again.', components: [] });
    }
}

module.exports = {
    STARTING_GOLD,
    activeTutorialDrafts,
    sendHeroSelectionStep,
    sendAbilitySelectionStep,
    sendWeaponSelectionStep,
    sendArmorSelectionStep,
    sendChampionRecapStep,
    insertAndDeckChampion,
    finalizeChampionTeam,
    generateRandomChampion,
    generateRandomChampionKit,
    sendWelcomePackStep,
    openWelcomePackAndGrantGold,
    sendInitialGoldAndBoosterStore,
    finalizeTutorialCompletion
};

function handleTutorialButton(interaction) {
    const userId = interaction.user.id;
    let userDraftState = activeTutorialDrafts.get(userId);
    switch (interaction.customId) {
        case 'tutorial_start_new_flow':
            if (!userDraftState) {
                userDraftState = { stage: 'NEW_FLOW_INITIAL_GREETING', champion1: {}, champion2: {}, receivedWelcomePack: false, initialGoldGranted: false, currentChampNum: 1 };
                activeTutorialDrafts.set(userId, userDraftState);
            }
            if (!userDraftState.receivedWelcomePack) {
                return sendWelcomePackStep(interaction, userId).then(() => {
                    userDraftState.receivedWelcomePack = true;
                    userDraftState.stage = 'WELCOME_PACK_OPENED';
                });
            }
            return sendInitialGoldAndBoosterStore(interaction, userId);
        case 'tutorial_open_welcome_pack':
            if (userDraftState && userDraftState.stage === 'WELCOME_PACK_OPENED') {
                return openWelcomePackAndGrantGold(interaction, userId).then(() => {
                    userDraftState.stage = 'GOLD_GRANTED_AND_STORE_OPENED';
                    userDraftState.initialGoldGranted = true;
                });
            }
            return interaction.editReply({ content: 'You already opened your welcome pack!', components: [] });
        case 'tutorial_confirm_tutorial_completion':
            return finalizeTutorialCompletion(interaction, userId);
        case 'tutorial_start_draft':
            if (userDraftState) userDraftState.stage = 'HERO_SELECTION';
            return sendHeroSelectionStep(interaction, userId, userDraftState.currentChampNum);
        case 'tutorial_recap_1_continue':
            if (userDraftState) {
                userDraftState.currentChampNum = 2;
                userDraftState.stage = 'HERO_SELECTION';
            }
            return sendHeroSelectionStep(interaction, userId, userDraftState.currentChampNum);
        case 'tutorial_recap_2_finalize':
            return finalizeChampionTeam(interaction, userId);
        case 'tutorial_start_over':
            activeTutorialDrafts.delete(userId);
            return interaction.editReply({ embeds: [simple('Draft Reset', [{ name: 'Starting Over!', value: 'Your champion draft has been reset. Use `/start` to begin again.' }])], components: [] });
        default:
            return interaction.editReply({ content: 'Something went wrong with the tutorial step. Please try `/start` again.', components: [] }).then(() => activeTutorialDrafts.delete(userId));
    }
}

module.exports = {
    STARTING_GOLD,
    activeTutorialDrafts,
    sendHeroSelectionStep,
    sendAbilitySelectionStep,
    sendWeaponSelectionStep,
    sendArmorSelectionStep,
    sendChampionRecapStep,
    insertAndDeckChampion,
    finalizeChampionTeam,
    generateRandomChampion,
    generateRandomChampionKit,
    sendWelcomePackStep,
    openWelcomePackAndGrantGold,
    sendInitialGoldAndBoosterStore,
    finalizeTutorialCompletion,
    handleTutorialButton
};
