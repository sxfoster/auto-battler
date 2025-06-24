const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const db = require('../util/database');
const {
    allPossibleHeroes,
    allPossibleWeapons,
    allPossibleArmors,
    allPossibleAbilities
} = require('../../backend/game/data');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View all cards and items in your collection.'),
    async execute(interaction) {
        console.log(`[INVENTORY DEBUG] Received interaction for user: ${interaction.user.id}, customId: ${interaction.customId || 'N/A'}, commandName: ${interaction.commandName || 'N/A'}`);
        console.log(`[INVENTORY DEBUG] Interaction type: ${interaction.type}, isChatInputCommand: ${interaction.isChatInputCommand()}`);

        // Flag to track if this command handled the initial reply/deferral
        let interactionHandledByThisCommand = false;

        // When invoked directly as a slash command, we must defer the reply.
        if (interaction.isChatInputCommand()) {
            try {
                console.log('[INVENTORY DEBUG] Attempting to deferReply for slash command.');
                await interaction.deferReply({ ephemeral: true });
                interactionHandledByThisCommand = true;
                console.log(`[INVENTORY DEBUG] deferReply successful. interactionHandledByThisCommand: ${interactionHandledByThisCommand}`);
            } catch (deferError) {
                console.error('[INVENTORY ERROR] deferReply failed for slash command:', deferError);
                return;
            }
        } else {
            console.log('[INVENTORY DEBUG] Not a chat input command. Assuming caller handled deferral.');
        }

        const userId = interaction.user.id;
        console.log(`[INVENTORY DEBUG] Fetching inventory for user: ${userId}`);

        try {
            const [rows] = await db.execute(
                `SELECT item_id, quantity, item_type FROM user_inventory WHERE user_id = ?`,
                [userId]
            );
            console.log(`[INVENTORY DEBUG] Fetched ${rows.length} inventory rows.`);

            const inventory = {
                hero: [],
                ability: [],
                weapon: [],
                armor: [],
                monster: [],
                other: []
            };

            for (const row of rows) {
                let itemName = `Unknown Item (ID: ${row.item_id})`;
                let itemRarity = '';
                let itemCategory = row.item_type || 'other';

                let itemData = null;
                switch (itemCategory) {
                    case 'hero':
                        itemData = allPossibleHeroes.find(h => h.id === row.item_id);
                        if (itemData && itemData.is_monster) itemCategory = 'monster';
                        break;
                    case 'ability':
                        itemData = allPossibleAbilities.find(a => a.id === row.item_id);
                        break;
                    case 'weapon':
                        itemData = allPossibleWeapons.find(w => w.id === row.item_id);
                        break;
                    case 'armor':
                        itemData = allPossibleArmors.find(a => a.id === row.item_id);
                        break;
                }

                if (itemData) {
                    itemName = itemData.name;
                    itemRarity = itemData.rarity ? ` (${itemData.rarity})` : '';
                } else if (itemCategory === 'monster') {
                    itemData = allPossibleHeroes.find(h => h.id === row.item_id && h.is_monster);
                    if (itemData) {
                        itemName = itemData.name;
                        itemRarity = itemData.rarity ? ` (${itemData.rarity})` : '';
                    }
                }

                if (inventory[itemCategory]) {
                    inventory[itemCategory].push(`**${itemName}**${itemRarity} x${row.quantity}`);
                } else {
                    inventory.other.push(`**${itemName}**${itemRarity} x${row.quantity}`);
                }
            }
            console.log('[INVENTORY DEBUG] Inventory processed.');

            const fields = [];
            if (inventory.hero.length > 0) fields.push({ name: 'Champions (Base)', value: inventory.hero.join('\n'), inline: true });
            if (inventory.monster.length > 0) fields.push({ name: 'Monsters', value: inventory.monster.join('\n'), inline: true });
            if (inventory.ability.length > 0) fields.push({ name: 'Abilities', value: inventory.ability.join('\n'), inline: true });
            if (inventory.weapon.length > 0) fields.push({ name: 'Weapons', value: inventory.weapon.join('\n'), inline: true });
            if (inventory.armor.length > 0) fields.push({ name: 'Armor', value: inventory.armor.join('\n'), inline: true });
            if (inventory.other.length > 0) fields.push({ name: 'Other Items', value: inventory.other.join('\n'), inline: true });

            if (fields.length === 0) {
                fields.push({ name: 'Your Inventory is Empty!', value: 'Use `/openpack` to acquire new cards!' });
            }
            console.log('[INVENTORY DEBUG] Embed fields prepared.');

            const embed = simple('🎒 Your Collection', fields);
            console.log('[INVENTORY DEBUG] Attempting to editReply.');
            const navigationRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('🏠')
                );
            await interaction.editReply({ embeds: [embed], components: [navigationRow] });
            console.log('[INVENTORY DEBUG] editReply successful.');

        } catch (error) {
            console.error('[INVENTORY ERROR] Error fetching or processing inventory:', error);
            if (interactionHandledByThisCommand) {
                await interaction.editReply({ content: 'Failed to retrieve your inventory due to an error. Check bot console for details.', components: [] });
            } else {
                await interaction.editReply({ content: 'Failed to retrieve your inventory due to an error. Check bot console for details.', components: [] });
            }
        }
    },
};
