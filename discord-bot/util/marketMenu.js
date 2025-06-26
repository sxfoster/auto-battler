function getMarketplaceMenu(category = 'tavern', page = 0) {
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
    const { simple } = require('../src/utils/embedBuilder');
    const { BOOSTER_PACKS } = require('../src/boosterConfig');

    const ITEMS_PER_PAGE = 10;
    const CATEGORY_INFO = {
        tavern: { title: '🍻 The Tavern', field: { name: 'Champions & Abilities', value: 'Recruit new heroes and learn new skills.' } },
        armory: { title: '🛡️ The Armory', field: { name: 'Weapons & Armor', value: 'Outfit your champions with the finest gear.' } },
        altar: { title: '💀 The Altar', field: { name: 'Monsters & Powers', value: 'Unleash forbidden powers and monstrous allies.' } }
    };

    const info = CATEGORY_INFO[category] || { title: 'Marketplace', field: { name: 'Packs', value: 'Available booster packs' } };
    const embed = simple(info.title, [info.field]);

    const packs = Object.entries(BOOSTER_PACKS).filter(([, p]) => p.category === category);
    const totalPages = Math.ceil(packs.length / ITEMS_PER_PAGE);
    const start = page * ITEMS_PER_PAGE;
    const pagePacks = packs.slice(start, start + ITEMS_PER_PAGE);

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`market_pack_select_${category}_${page}`)
        .setPlaceholder('Choose a booster pack')
        .addOptions(pagePacks.map(([id, p]) => ({
            label: p.name,
            description: `${p.cost} ${p.currency === 'soft_currency' ? 'Gold 🪙' : 'Gems 💎'}`,
            value: id
        })));

    const categoryRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('market_tavern').setLabel('The Tavern').setStyle(ButtonStyle.Primary).setEmoji('🍻').setDisabled(category === 'tavern'),
        new ButtonBuilder().setCustomId('market_armory').setLabel('The Armory').setStyle(ButtonStyle.Secondary).setEmoji('🛡️').setDisabled(category === 'armory'),
        new ButtonBuilder().setCustomId('market_altar').setLabel('The Altar').setStyle(ButtonStyle.Danger).setEmoji('💀').setDisabled(category === 'altar')
    );

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);
    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`market_page_prev_${category}_${page - 1}`)
            .setLabel('Previous')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⬅️')
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId(`market_page_next_${category}_${page + 1}`)
            .setLabel('Next')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('➡️')
            .setDisabled(page >= totalPages - 1)
    );

    const backButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('back_to_market').setLabel('Back to Marketplace').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
    );

    return { embeds: [embed], components: [categoryRow, selectRow, paginationRow, backButton], ephemeral: true };
}

module.exports = { getMarketplaceMenu };
