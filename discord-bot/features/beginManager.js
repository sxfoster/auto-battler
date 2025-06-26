const { MessageFlags } = require('discord.js');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const db = require('../util/database');
const { startEquipFlow } = require('./equipManager');

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

    try {
        await startEquipFlow(interaction, userId);
    } catch (err) {
        console.error('Failed to start equip flow:', err);
    }
}

module.exports = {
    showClassSelection,
    handleClassSelected,
    userClassChoices
};
