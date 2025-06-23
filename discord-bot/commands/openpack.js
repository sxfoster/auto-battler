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

// Booster pack definitions used for consistent display names
const BOOSTER_PACKS = {
    hero_pack: { name: 'Hero Pack', rarity: 'basic' },
    ability_pack: { name: 'Ability Pack', rarity: 'standard' },
    weapon_pack: { name: 'Weapon Pack', rarity: 'premium' },
    armor_pack: { name: 'Armor Pack', rarity: 'basic' }
};

// Helper to select cards by rarity tier
function getRandomCardsForPack(pool, count = 3, packRarity = 'basic') {
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('openpack')
        .setDescription('Open a booster pack of a specific type.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of booster pack to open.')
                .setRequired(true)
                .addChoices(
                    { name: 'Hero Pack', value: 'hero_pack' },
                    { name: 'Ability Pack', value: 'ability_pack' },
                    { name: 'Weapon Pack', value: 'weapon_pack' },
                    { name: 'Armor Pack', value: 'armor_pack' }
                ))
        .addStringOption(option =>
            option.setName('rarity')
                .setDescription('The rarity level of the pack (default: basic).')
                .setRequired(false)
                .addChoices(
                    { name: 'Basic', value: 'basic' },
                    { name: 'Standard', value: 'standard' },
                    { name: 'Premium', value: 'premium' }
                )),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const packTypeRaw = interaction.options.getString('type');
        const packRarity = interaction.options.getString('rarity') || BOOSTER_PACKS[packTypeRaw].rarity;

        let cardPool = [];
        let awardedCardsCount = 0;
        let actualItemType = '';

        switch (packTypeRaw) {
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
            default:
                await interaction.editReply({ content: 'Invalid pack type selected.', ephemeral: true });
                return;
        }

        const awardedCards = getRandomCardsForPack(cardPool, awardedCardsCount, packRarity);

        if (awardedCards.length === 0) {
            await interaction.editReply({ content: `Could not generate cards for ${packTypeRaw}. The card pool might be empty for selected rarity.`, ephemeral: true });
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
                    [userId, card.id, actualItemType]
                );
            } catch (error) {
                console.error(`Error adding card ${card.id} to inventory for user ${userId}:`, error);
            }
        }

        const packDisplayName = BOOSTER_PACKS[packTypeRaw].name;

        const resultsEmbed = simple(
            `📦 ${packDisplayName} Opened!`,
            [{ name: 'Cards Received', value: cardNames.join('\n') }]
        );

        await interaction.editReply({ embeds: [resultsEmbed] });
        await interaction.followUp({ embeds: [confirm('Your new cards have been added to your collection!')], ephemeral: true });
    },
};
