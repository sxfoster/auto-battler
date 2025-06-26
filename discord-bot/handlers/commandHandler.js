const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../util/database');
const { getHeroById } = require('../util/gameData');
const { allPossibleWeapons, allPossibleArmors, allPossibleAbilities } = require('../../backend/game/data');

module.exports = async (interaction, client) => {
    if (interaction.commandName === 'team' && interaction.options.getSubcommand() === 'set-defense') {
        try {
            const userId = interaction.user.id;
            const [ownedChampions] = await db.execute(
                'SELECT id, base_hero_id, level FROM user_champions WHERE user_id = ?',
                [userId]
            );
            if (ownedChampions.length < 1) {
                await interaction.reply({ content: 'You need at least one champion in your roster to set a defense team.', flags: [MessageFlags.Ephemeral] });
                return;
            }
            const options = ownedChampions.map(champion => {
                const staticData = getHeroById(champion.base_hero_id);
                const name = staticData ? staticData.name : `Unknown Hero (ID: ${champion.base_hero_id})`;
                const rarity = staticData ? staticData.rarity : 'Unknown';
                const heroClass = staticData ? staticData.class : 'Unknown';
                return {
                    label: `${name} (Lvl ${champion.level})`,
                    description: `${rarity} ${heroClass}`,
                    value: champion.id.toString(),
                };
            });
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('defense_team_select')
                .setPlaceholder('Select your defense team (1 Monster OR 2 Champions)')
                .setMinValues(1)
                .setMaxValues(2)
                .addOptions(options);
            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.reply({ content: 'Choose your defense team!', components: [row], flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            console.error('Error preparing defense team selection:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'An error occurred while preparing your defense team.', flags: [MessageFlags.Ephemeral] });
            }
        }
        return;
    }
    if (interaction.commandName === 'team' && interaction.options.getSubcommand() === 'manage') {
        try {
            const userId = interaction.user.id;
            const championId = interaction.options.getString('champion');
            const [rows] = await db.execute(
                `SELECT uc.*, h.name, h.class FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.id = ? AND uc.user_id = ?`,
                [championId, userId]
            );
            if (rows.length === 0) {
                await interaction.reply({ content: 'Champion not found.', flags: [MessageFlags.Ephemeral] });
                return;
            }
            const champ = rows[0];
            const [deckRows] = await db.execute(
                `SELECT cd.ability_id, a.name FROM champion_decks cd JOIN abilities a ON cd.ability_id = a.id WHERE cd.user_champion_id = ? ORDER BY cd.order_index ASC`,
                [championId]
            );
            const currentDeckAbilities = deckRows.map(row => row.name).join(', ') || 'None';
            const [invAbilityRows] = await db.execute(
                `SELECT ui.item_id, a.name FROM user_inventory ui JOIN abilities a ON ui.item_id = a.id WHERE ui.user_id = ? AND a.class = ? AND ui.quantity > 0`,
                [userId, champ.class]
            );
            const availableAbilityOptions = invAbilityRows.map(item => ({
                label: item.name,
                description: `Ability ID: ${item.item_id}`,
                value: String(item.item_id),
            }));
            const embed = new EmbedBuilder()
                .setColor('#29b6f6')
                .setTitle(`⚙️ Manage ${champ.name}`)
                .setThumbnail(getHeroById(champ.base_hero_id).imageUrl || null)
                .addFields(
                    { name: 'Level', value: String(champ.level), inline: true },
                    { name: 'XP', value: String(champ.xp || 0), inline: true },
                    { name: 'Equipped Weapon', value: champ.equipped_weapon_id ? (allPossibleWeapons.find(w => w.id === champ.equipped_weapon_id)?.name || `ID ${champ.equipped_weapon_id}`) : 'None', inline: true },
                    { name: 'Equipped Armor', value: champ.equipped_armor_id ? (allPossibleArmors.find(a => a.id === champ.equipped_armor_id)?.name || `ID ${champ.equipped_armor_id}`) : 'None', inline: true },
                    { name: 'Equipped Ability (Slot 1)', value: champ.equipped_ability_id ? (allPossibleAbilities.find(ab => ab.id === champ.equipped_ability_id)?.name || `ID ${champ.equipped_ability_id}`) : 'None', inline: true },
                    { name: 'Deck Abilities', value: currentDeckAbilities, inline: false }
                );
            const components = [];
            if (availableAbilityOptions.length > 0) {
                const deckAbilitySelect = new StringSelectMenuBuilder()
                    .setCustomId(`manage_deck_ability_${championId}`)
                    .setPlaceholder('Add an ability to deck (1st slot only)')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(availableAbilityOptions.slice(0, 25));
                components.push(new ActionRowBuilder().addComponents(deckAbilitySelect));
            } else {
                components.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('no_abilities_available')
                        .setLabel('No Abilities Available for Deck')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                ));
            }
            const navigationRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('back_to_barracks_from_champ').setLabel('Back to Roster').setStyle(ButtonStyle.Secondary).setEmoji('⬅️'),
                    new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('🏠')
                );
            components.push(navigationRow);
            await interaction.reply({ embeds: [embed], components, flags: [MessageFlags.Ephemeral] });
        } catch (err) {
            console.error('Error preparing champion management:', err);
            if (!interaction.replied) {
                await interaction.reply({ content: 'An error occurred while preparing this menu.', flags: [MessageFlags.Ephemeral] });
            }
        }
        return;
    }
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}`, error);
        const replyOptions = { content: 'There was an error executing this command!', flags: [MessageFlags.Ephemeral] };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    }
};
