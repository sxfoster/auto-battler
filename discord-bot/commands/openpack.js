const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const confirm = require('../src/utils/confirm');
const db = require('../util/database');
const {
    allPossibleHeroes,
    allPossibleWeapons,
    allPossibleArmors,
    allPossibleAbilities
} = require('../../backend/game/data');

function getRandomCards(pool, count = 3, allowedRarities = ['Common', 'Uncommon']) {
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('openpack')
        .setDescription('Open a booster pack of a specific type.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of booster pack to open.')
                .setRequired(true)
                .addChoices(
                    { name: 'Hero Pack', value: 'hero' },
                    { name: 'Ability Pack', value: 'ability' },
                    { name: 'Weapon Pack', value: 'weapon' },
                    { name: 'Armor Pack', value: 'armor' }
                )),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const packType = interaction.options.getString('type');

        let cardPool = [];
        let packName = '';
        let awardedCards = [];

        switch (packType) {
            case 'hero':
                cardPool = allPossibleHeroes;
                packName = 'Hero Pack';
                awardedCards = getRandomCards(cardPool.filter(h => !h.isMonster), 1, ['Common', 'Uncommon', 'Rare']);
                break;
            case 'ability':
                cardPool = allPossibleAbilities;
                packName = 'Ability Pack';
                awardedCards = getRandomCards(cardPool, 3, ['Common', 'Uncommon', 'Rare']);
                break;
            case 'weapon':
                cardPool = allPossibleWeapons;
                packName = 'Weapon Pack';
                awardedCards = getRandomCards(cardPool, 2, ['Common', 'Uncommon']);
                break;
            case 'armor':
                cardPool = allPossibleArmors;
                packName = 'Armor Pack';
                awardedCards = getRandomCards(cardPool, 2, ['Common', 'Uncommon']);
                break;
            default:
                await interaction.editReply({ content: 'Invalid pack type selected.', ephemeral: true });
                return;
        }

        if (awardedCards.length === 0) {
            await interaction.editReply({ content: `Could not generate cards for ${packName}.`, ephemeral: true });
            return;
        }

        const cardNames = [];
        for (const card of awardedCards) {
            cardNames.push(`**${card.name}** (${card.rarity})`);
            try {
                await db.execute(
                    `INSERT INTO user_inventory (user_id, item_id, quantity, item_type)
                     VALUES (?, ?, 1, ?)
                     ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
                    [userId, card.id, card.type || packType]
                );
            } catch (error) {
                console.error(`Error adding card ${card.id} to inventory for user ${userId}:`, error);
            }
        }

        const resultsEmbed = simple(
            `📦 ${packName} Opened!`,
            [{ name: 'Cards Received', value: cardNames.join('\n') }]
        );

        await interaction.editReply({ embeds: [resultsEmbed] });
        await interaction.followUp({ embeds: [confirm('Your new cards have been added to your collection!')], ephemeral: true });
    },
};
