const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { sendHeroSelection } = require('../managers/DraftManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('draft')
        .setDescription('Starts a new game by drafting your team.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        const [userRows] = await db.execute('SELECT current_game_id FROM users WHERE discord_id = ?', [userId]);
        if (userRows[0] && userRows[0].current_game_id) {
            return interaction.reply({ content: 'You are already in a game! Finish or forfeit that one first.', ephemeral: true });
        }

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
