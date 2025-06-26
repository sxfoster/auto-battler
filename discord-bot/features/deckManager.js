const { InteractionResponseFlags } = require('discord-api-types/v10');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../util/database');
const { allPossibleAbilities } = require('../../backend/game/data');
const { getHeroById } = require('../util/gameData');

const activeDeckEdits = new Map();

async function sendDeckEditScreen(interaction, userId, championId, isUpdate = false) {
    try {
        const [champRows] = await db.execute(
            `SELECT uc.*, h.name, h.class FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.id = ? AND uc.user_id = ?`,
            [championId, userId]
        );
        if (champRows.length === 0) {
            await interaction.editReply({ content: 'Champion not found or does not belong to you.', components: [] });
            return;
        }
        const champion = champRows[0];
        const heroData = getHeroById(champion.base_hero_id);

        let state = activeDeckEdits.get(userId);
        if (!state || state.championId !== championId) {
            const [currentDeckRaw] = await db.execute(
                `SELECT ability_id FROM champion_decks WHERE user_champion_id = ? ORDER BY order_index ASC`,
                [championId]
            );
            state = { championId, deck: currentDeckRaw.map(r => r.ability_id) };
            activeDeckEdits.set(userId, state);
        }

        const deckCounts = {};
        for (const id of state.deck) {
            deckCounts[id] = (deckCounts[id] || 0) + 1;
        }
        const currentDeckSize = state.deck.length;
        const currentDeckDisplay = Object.entries(deckCounts).map(([id, c]) => {
            const ability = allPossibleAbilities.find(a => a.id === parseInt(id));
            return `${ability ? ability.name : `ID ${id}`} (x${c})`;
        });
        const currentDeckString = currentDeckDisplay.join('\n') || 'None (Deck empty)';

        const [availableAbilitiesRaw] = await db.execute(
            `SELECT ui.item_id, ui.quantity, a.name, a.energy_cost, a.effect, a.rarity
             FROM user_inventory ui JOIN abilities a ON ui.item_id = a.id
             WHERE ui.user_id = ? AND a.class = ? AND ui.quantity > 0`,
            [userId, champion.class]
        );

        const availableAbilityOptions = [];
        availableAbilitiesRaw.forEach(ab => {
            const currentCountInDeck = deckCounts[ab.item_id] || 0;
            if (currentCountInDeck < 2) {
                availableAbilityOptions.push({
                    label: ab.name,
                    description: `⚡ ${ab.energy_cost} | ${ab.effect} (Owned: ${ab.quantity} | In Deck: ${currentCountInDeck})`,
                    value: String(ab.item_id),
                });
            }
        });

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`📚 Edit Deck: ${champion.name} (${champion.class})`)
            .setThumbnail(heroData?.imageUrl || null)
            .addFields(
                { name: 'Current Deck (Max 20 cards)', value: currentDeckString, inline: false },
                { name: 'Deck Size', value: `${currentDeckSize}/20 cards`, inline: true },
                { name: 'Rules', value: 'Max 2 copies of any single card.', inline: true }
            );

        const components = [];
        if (currentDeckSize < 20 && availableAbilityOptions.length > 0) {
            const addCardSelect = new StringSelectMenuBuilder()
                .setCustomId(`deck_add_${championId}`)
                .setPlaceholder('Add Ability to Deck')
                .addOptions(availableAbilityOptions.slice(0, 25));
            components.push(new ActionRowBuilder().addComponents(addCardSelect));
        } else if (currentDeckSize >= 20) {
            components.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('deck_full').setLabel('Deck is Full (20/20)').setStyle(ButtonStyle.Secondary).setDisabled(true)
            ));
        } else {
            components.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('no_abilities_to_add').setLabel('No Abilities to Add').setStyle(ButtonStyle.Secondary).setDisabled(true)
            ));
        }

        if (currentDeckSize > 0) {
            const removeCardOptions = Object.keys(deckCounts).map(id => {
                const ability = allPossibleAbilities.find(a => a.id === parseInt(id));
                return {
                    label: ability ? ability.name : `ID ${id}`,
                    description: `Remove ${ability ? ability.name : id}`,
                    value: String(id)
                };
            });
            const removeCardSelect = new StringSelectMenuBuilder()
                .setCustomId(`deck_remove_${championId}`)
                .setPlaceholder('Remove Ability from Deck')
                .addOptions(removeCardOptions.slice(0, 25));
            components.push(new ActionRowBuilder().addComponents(removeCardSelect));
        }

        const actionButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`deck_save_${championId}`).setLabel('Save Deck').setStyle(ButtonStyle.Success).setEmoji('💾'),
            new ButtonBuilder().setCustomId(`deck_cancel_${championId}`).setLabel('Cancel').setStyle(ButtonStyle.Danger).setEmoji('❌')
        );
        components.push(actionButtons);

        await interaction.editReply({ embeds: [embed], components });
    } catch (error) {
        console.error(`[CRITICAL ERROR] sendDeckEditScreen failed for championId ${championId}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Failed to open deck editor due to an unexpected error.', flags: [InteractionResponseFlags.EPHEMERAL] });
        } else {
            await interaction.editReply({ content: 'Failed to open deck editor due to an unexpected error. Check bot console for details.', components: [] });
        }
    }
}

function buildDeckEditEmbed(champion, deck) {
    const counts = {};
    for (const id of deck) {
        counts[id] = (counts[id] || 0) + 1;
    }
    const deckList = Object.entries(counts).map(([id, c]) => {
        const name = allPossibleAbilities.find(ab => ab.id === parseInt(id))?.name || `ID ${id}`;
        return `${name} (x${c})`;
    }).join(', ');
    return new EmbedBuilder()
        .setColor('#29b6f6')
        .setTitle(`Editing Deck: ${champion.name}`)
        .addFields(
            { name: 'Deck', value: deckList || 'Empty', inline: false },
            { name: 'Deck Size', value: `${deck.length}/20 cards`, inline: true },
            { name: 'Rules', value: 'Max 20 cards, 2x per card', inline: true }
        );
}

module.exports = { activeDeckEdits, sendDeckEditScreen, buildDeckEditEmbed };
