const { MessageFlags } = require('discord.js');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const db = require('../util/database');

async function startEquipFlow(interaction, userId) {
    const [[userRow]] = await db.execute('SELECT starter_class FROM users WHERE discord_id = ?', [userId]);
    const userClass = userRow?.starter_class;
    if (!userClass) {
        await interaction.followUp({ content: 'No class found for your user.', flags: [MessageFlags.Ephemeral] });
        return;
    }

    const [abilityRows] = await db.execute(
        `SELECT ui.item_id, a.name, a.effect
         FROM user_inventory ui JOIN abilities a ON ui.item_id = a.id
         WHERE ui.user_id = ? AND a.class = ? AND ui.quantity > 0`,
        [userId, userClass]
    );

    if (abilityRows.length === 0) {
        await interaction.followUp({ content: 'You have no ability cards for your class.', flags: [MessageFlags.Ephemeral] });
        return;
    }

    const options = abilityRows.slice(0, 4).map(ab => ({
        label: ab.name,
        description: ab.effect,
        value: String(ab.item_id)
    }));

    const menu = new StringSelectMenuBuilder()
        .setCustomId('equip_select')
        .setPlaceholder('Select abilities to equip')
        .setMinValues(1)
        .setMaxValues(options.length)
        .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);
    const promptEmbed = new EmbedBuilder()
        .setColor('#0ea5e9')
        .setTitle('Equip Abilities')
        .setDescription('Choose up to 4 abilities to equip to your champion.');

    const msg = await interaction.followUp({ embeds: [promptEmbed], components: [row], flags: [MessageFlags.Ephemeral], fetchReply: true });

    let selectInteraction;
    try {
        selectInteraction = await msg.awaitMessageComponent({ time: 60000 });
    } catch {
        await msg.edit({ content: 'Equip timed out.', components: [] });
        return;
    }

    const selectedIds = selectInteraction.values.map(v => parseInt(v));

    const [[champRow]] = await db.execute('SELECT id FROM user_champions WHERE user_id = ? ORDER BY id ASC LIMIT 1', [userId]);
    const championId = champRow?.id;
    if (!championId) {
        await selectInteraction.update({ content: 'No champion found to equip.', components: [] });
        return;
    }

    await db.execute('DELETE FROM champion_decks WHERE user_champion_id = ?', [championId]);
    for (let i = 0; i < selectedIds.length; i++) {
        await db.execute(
            'INSERT INTO champion_decks (user_champion_id, ability_id, order_index) VALUES (?, ?, ?)',
            [championId, selectedIds[i], i]
        );
    }

    const selectedNames = abilityRows
        .filter(ab => selectedIds.includes(ab.item_id))
        .map(ab => ab.name)
        .join(', ');

    const resultEmbed = new EmbedBuilder()
        .setColor('#84cc16')
        .setTitle('Abilities Equipped')
        .setDescription(`Equipped: ${selectedNames}`);

    await selectInteraction.update({ embeds: [resultEmbed], components: [] });
}

module.exports = { startEquipFlow };
