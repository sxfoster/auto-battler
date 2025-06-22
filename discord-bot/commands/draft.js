const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../util/database');
const { sendHeroSelection } = require('../managers/DraftManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('draft')
        .setDescription('Starts a new game by drafting your team.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        // Check if the user is already in a game
        const [userRows] = await db.execute('SELECT current_game_id FROM users WHERE discord_id = ?', [userId]);
        const activeGameId = userRows[0] ? userRows[0].current_game_id : null;

        if (activeGameId) {
            // User is in a game, so offer a choice instead of an error
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`forfeit_${activeGameId}`)
                        .setLabel('Forfeit & Start New Draft')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`cancel_draft`)
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                );

            return interaction.reply({
                content: `You are already in Game #${activeGameId}. Do you want to forfeit that game and start a new one?`,
                components: [row],
                ephemeral: true
            });
        }

        // If no active game, proceed to create a new one as before
        await interaction.reply({ content: 'Your draft is starting! Please check your Direct Messages.', ephemeral: true });

        const initialDraftState = { stage: 'HERO_SELECTION', team: {} };
        const [newGame] = await db.execute(
            "INSERT INTO games (player1_id, status, draft_state) VALUES (?, 'drafting', ?)",
            [userId, JSON.stringify(initialDraftState)]
        );
        const gameId = newGame.insertId;

        await db.execute('UPDATE users SET current_game_id = ? WHERE discord_id = ?', [gameId, userId]);

        try {
            await sendHeroSelection(interaction, gameId);
        } catch (error) {
            console.error(`Could not send DM to ${interaction.user.tag}.`, error);
            await db.execute('DELETE FROM games WHERE id = ?', [gameId]);
            await db.execute('UPDATE users SET current_game_id = NULL WHERE discord_id = ?', [userId]);
            await interaction.followUp({ content: "I couldn't send you a DM! Please check your privacy settings.", ephemeral: true });
        }
    },
};
