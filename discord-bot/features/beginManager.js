const { MessageFlags } = require('discord.js');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');
const { startEquipFlow } = require('./equipManager');
const { allPossibleAbilities } = require('../../backend/game/data');
const { getRandomCardsForPack } = require('../util/gameData');

// In-memory map storing chosen class keyed by discord_id
const userClassChoices = new Map();

async function showClassSelection(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#0ea5e9')
        .setTitle('Choose Your Class')
        .setDescription('Select a starting class to receive your starter ability cards.');

    const select = new StringSelectMenuBuilder()
        .setCustomId('begin_class_select')
        .setPlaceholder('Select your class')
        .addOptions(
            { label: 'Warrior', value: 'Warrior' },
            { label: 'Mage', value: 'Mage' },
            { label: 'Rogue', value: 'Rogue' }
        );

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({ embeds: [embed], components: [row], flags: [MessageFlags.Ephemeral] });
}

async function handleClassSelected(interaction, userId, chosenClass) {
    userClassChoices.set(userId, chosenClass);
    try {
        await db.execute('UPDATE users SET class = ? WHERE discord_id = ?', [chosenClass, userId]);
    } catch (err) {
        // Ignore if column doesn't exist or DB update fails
    }

    const embed = new EmbedBuilder()
        .setColor('#84cc16')
        .setTitle(`You chose ${chosenClass}!`)
        .setDescription("You'll receive your starter ability cards soon.");

    await interaction.editReply({ embeds: [embed], components: [] });

    await openStarterPack(chosenClass, userId, interaction);
}

async function openStarterPack(chosenClass, userId, interaction) {
    const abilityPool = allPossibleAbilities.filter(ab => ab.class === chosenClass);
    const cards = getRandomCardsForPack(abilityPool, 3, 'standard');
    try {
        for (const card of cards) {
            await db.execute(
                'INSERT INTO user_inventory (user_id, item_id, quantity, item_type) VALUES (?, ?, 1, ?) ON DUPLICATE KEY UPDATE quantity = quantity + 1',
                [userId, card.id, 'ability']
            );
        }
    } catch (err) {
        console.error('Failed to insert starter cards:', err);
        await interaction.followUp({ content: 'Failed to grant starter cards.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
        return;
    }

    const fields = cards.map(c => ({ name: c.name, value: c.effect }));
    try {
        const embed = simple('🎁 Starter Pack', fields);
        const msg = await interaction.followUp({ embeds: [embed] });
        await startEquipFlow(interaction, userId);
    } catch (err) {
        console.error('Failed to send starter pack embed:', err);
        await interaction.followUp({ content: 'Failed to send starter pack info.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
    }
}

module.exports = {
    showClassSelection,
    handleClassSelected,
    openStarterPack,
    userClassChoices
};
