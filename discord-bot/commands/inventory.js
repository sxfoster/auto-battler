const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
        if (interaction.deferred || interaction.replied) {
            await interaction.deferUpdate();
        } else {
            await interaction.deferReply({ ephemeral: true });
        }

        const userId = interaction.user.id;

        try {
            const [rows] = await db.execute(
                `SELECT item_id, quantity, item_type FROM user_inventory WHERE user_id = ?`,
                [userId]
            );

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
                        if (itemData && itemData.isMonster) itemCategory = 'monster';
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
                    itemData = allPossibleHeroes.find(h => h.id === row.item_id && h.isMonster);
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

            const embed = simple('🎒 Your Collection', fields);
            await interaction.editReply({ embeds: [embed], components: [] });

        } catch (error) {
            console.error('Error fetching inventory:', error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: 'Failed to retrieve your inventory due to an error.', components: [] });
            } else {
                await interaction.reply({ content: 'Failed to retrieve your inventory due to an error.', ephemeral: true });
            }
        }
    },
};
