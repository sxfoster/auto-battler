const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { setTimeout: sleep } = require('node:timers/promises');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');
const { generateCardImage } = require('../src/utils/cardRenderer');
const { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } = require('../../backend/game/data');
const { getRandomCardsForPack } = require('../util/gameData');

const { BOOSTER_PACKS } = require('../src/boosterConfig');
const { getMarketplaceMenu } = require('../util/marketMenu');

async function handleBoosterPurchase(interaction, userId, packId, page = 0) {
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

    if (packInfo.currency === 'soft_currency') {
        try {
            const [rows] = await db.execute('SELECT soft_currency FROM users WHERE discord_id = ?', [userId]);
            const gold = rows[0]?.soft_currency;
            console.log(`Attempting to DM user ${userId} new gold balance: ${gold}`);
            await interaction.user.send(`\uD83D\uDCB0 Debug: Your new gold balance is ${gold}`);
            console.log(`Successfully DM'd user ${userId} updated gold balance.`);
        } catch (err) {
            console.error('Failed to DM updated gold balance:', err);
        }
    }

    let cardPool = [];
    let awardedCardsCount = 0;
    let actualItemType = '';
    switch (packInfo.type) {
        case 'hero_pack':
            cardPool = allPossibleHeroes.filter(h => !h.is_monster);
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
        case 'monster_pack':
            cardPool = allPossibleHeroes.filter(h => h.is_monster);
            awardedCardsCount = 1;
            actualItemType = 'monster';
            break;
        case 'monster_ability_pack':
            cardPool = allPossibleAbilities.filter(ab => ab.class && ab.class.includes('Monster'));
            awardedCardsCount = 2;
            actualItemType = 'monster_ability';
            break;
        default:
            await interaction.editReply({ content: 'Internal error: Unknown pack content type.', ephemeral: true });
            return;
    }
    const awardedCards = getRandomCardsForPack(cardPool, awardedCardsCount, packInfo.rarity);
    const cardNames = [];
    const announcementsChannel = interaction.client.channels.cache.get(process.env.ANNOUNCEMENT_CHANNEL_ID);
    for (const card of awardedCards) {
        cardNames.push(`**${card.name}** (${card.rarity})`);
        let alreadyOwned = false;
        try {
            const [ownedRows] = await db.execute(
                'SELECT 1 FROM user_inventory WHERE user_id = ? AND item_id = ?',
                [userId, card.id]
            );
            alreadyOwned = ownedRows.length > 0;
        } catch (error) {
            console.error('Error checking existing card ownership:', error);
        }
        try {
            await db.execute(
                `INSERT INTO user_inventory (user_id, item_id, quantity, item_type) VALUES (?, ?, 1, ?) ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
                [userId, card.id, actualItemType]
            );
        } catch (error) {
            console.error(`Error adding card ${card.id} to inventory for user ${userId} during purchase:`, error);
        }
        if (!alreadyOwned && announcementsChannel) {
            try {
                await announcementsChannel.send(`\uD83D\uDCE3 **${interaction.user.username}** has obtained a new card: **${card.name}** (${card.rarity})!`);
            } catch (err) {
                console.error('Failed to announce new card:', err);
            }
        }
    }
    console.log(`User ${userId} opened pack ${packId} (${packInfo.type}) and drew ${awardedCards.map(c => c.name).join(', ')}`);
    const resultsEmbed = new EmbedBuilder()
        .setColor('#FDE047')
        .setTitle(`✨ ${packInfo.name} Opened! ✨`)
        .setDescription(`You spent ${packInfo.cost} ${packInfo.currency === 'soft_currency' ? 'Gold 🪙' : 'Gems 💎'}.`)
        .addFields({ name: 'Cards Received:', value: cardNames.join('\n') || 'No cards received.', inline: false })
        .setFooter({ text: 'Your new cards have been added to your collection!' })
        .setTimestamp();
    const viewInventoryButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('view_inventory_from_pack').setLabel('View Inventory').setStyle(ButtonStyle.Secondary).setEmoji('🎒')
    );
    await interaction.editReply({ embeds: [resultsEmbed], components: [viewInventoryButton] });

    for (const card of awardedCards) {
        let cardBuffer = null;
        try {
            cardBuffer = await generateCardImage(card);
        } catch (err) {
            console.error(`Failed to generate image for card ${card.name}:`, err);
        }
        console.log(`DMing card ${card.name} to user ${interaction.user.username} (${interaction.user.id})`);
        const embed = new EmbedBuilder()
            .setColor('#FDE047')
            .setTitle('✨ You pulled a new card! ✨')
            .addFields({ name: 'Name', value: card.name, inline: true }, { name: 'Rarity', value: card.rarity, inline: true })
            .setTimestamp();
        try {
            const files = cardBuffer ? [{ attachment: cardBuffer, name: `${card.name}.png` }] : [];
            await interaction.user.send({ embeds: [embed], files });
            console.log(`Sent card DM to ${interaction.user.username} for card ${card.name}`);
        } catch (err) {
            console.error(`Failed to DM card ${card.name} to ${interaction.user.username}:`, err);
        }
        await sleep(500);
    }
}

module.exports = { BOOSTER_PACKS, getMarketplaceMenu, handleBoosterPurchase };
