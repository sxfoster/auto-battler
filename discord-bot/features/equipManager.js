const { MessageFlags } = require('discord.js');
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');

async function startEquipFlow(interaction, userId) {
    let userClass;
    try {
        const [rows] = await db.execute('SELECT class FROM users WHERE discord_id = ?', [userId]);
        userClass = rows[0]?.class;
    } catch (err) {
        console.error('Failed to fetch user class:', err);
        return;
    }
    if (!userClass) return;

    const [abilities] = await db.execute(
        `SELECT ui.item_id, a.name, a.effect
         FROM user_inventory ui JOIN abilities a ON ui.item_id = a.id
         WHERE ui.user_id = ? AND a.class = ? AND ui.quantity > 0`,
        [userId, userClass]
    );

    if (!abilities.length) {
        await interaction.followUp({ content: 'No abilities available to equip.', flags: [MessageFlags.Ephemeral] });
        return;
    }

    const options = abilities.slice(0, 4).map(ab => ({
        label: ab.name,
        description: ab.effect,
        value: String(ab.item_id)
    }));

    const select = new StringSelectMenuBuilder()
        .setCustomId('equip_select')
        .setPlaceholder('Select abilities')
        .setMinValues(1)
        .setMaxValues(options.length)
        .addOptions(options);
    const confirmButton = new ButtonBuilder()
        .setCustomId('equip_confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Primary);

    const msg = await interaction.followUp({
        content: 'Choose abilities to equip:',
        components: [
            new ActionRowBuilder().addComponents(select),
            new ActionRowBuilder().addComponents(confirmButton)
        ],
        fetchReply: true,
        flags: [MessageFlags.Ephemeral]
    });

    try {
        const selectInteraction = await msg.awaitMessageComponent({ time: 30000 });
        const chosenIds = selectInteraction.values.map(v => parseInt(v));
        await selectInteraction.deferUpdate();
        const confirmInteraction = await msg.awaitMessageComponent({ time: 30000 });
        if (confirmInteraction.customId !== 'equip_confirm') return;
        await confirmInteraction.deferUpdate?.();
        const [champRows] = await db.execute('SELECT id FROM user_champions WHERE user_id = ? LIMIT 1', [userId]);
        const championId = champRows[0]?.id;
        if (championId) {
            for (let i = 0; i < chosenIds.length; i++) {
                await db.execute(
                    'INSERT INTO champion_decks (user_champion_id, ability_id, order_index) VALUES (?, ?, ?)',
                    [championId, chosenIds[i], i]
                );
            }
        }
        const names = abilities.filter(ab => chosenIds.includes(ab.item_id)).map(ab => ab.name);
        const embed = simple('Abilities Equipped', [{ name: 'Equipped', value: names.join(', ') }]);
        await confirmInteraction.update({ embeds: [embed], components: [], flags: [MessageFlags.Ephemeral] });
    } catch (err) {
        console.error('Equip flow failed:', err);
    }
}

module.exports = { startEquipFlow };
