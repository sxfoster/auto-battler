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

const PACK_COLUMN_BASE = {
    hero_pack: 'hero_packs',
    ability_pack: 'ability_packs',
    weapon_pack: 'weapon_packs',
    armor_pack: 'armor_packs'
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

const command = {
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

        const columnBase = PACK_COLUMN_BASE[packTypeRaw];
        if (!columnBase) {
            await interaction.editReply({ content: 'Invalid pack type selected.', ephemeral: true });
            return;
        }

        const columnName = `${packRarity}_${columnBase}`;
        try {
            await db.execute(
                `UPDATE users SET ${columnName} = COALESCE(${columnName}, 0) + 1 WHERE discord_id = ?`,
                [userId]
            );
        } catch (err) {
            console.error('Error updating pack count:', err);
            await interaction.editReply({ content: 'Failed to add pack to your account.', ephemeral: true });
            return;
        }

        const packDisplayName = BOOSTER_PACKS[packTypeRaw].name;

        const resultsEmbed = simple(
            `📦 ${packDisplayName} Received!`,
            [{ name: 'Result', value: 'You received one pack.' }]
        );

        await interaction.editReply({ embeds: [resultsEmbed] });
    },
};

module.exports = { ...command, getRandomCardsForPack };
