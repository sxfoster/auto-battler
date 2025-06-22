const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Starts a new game or joins an existing one.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        // 1. Check if the user is already in an active game
        const [userRows] = await db.execute('SELECT current_game_id FROM users WHERE discord_id = ?', [userId]);
        if (userRows[0] && userRows[0].current_game_id) {
            return interaction.reply({ content: 'You are already in a game! Finish that one before starting a new one.', ephemeral: true });
        }

        // 2. Find a pending game with only one player
        const [gameRows] = await db.execute("SELECT * FROM games WHERE status = 'pending' AND player2_id IS NULL");

        if (gameRows.length > 0) {
            // 3. Join an existing game
            const game = gameRows[0];
            if (game.player1_id === userId) {
                 return interaction.reply({ content: "You can't play against yourself! Waiting for another player.", ephemeral: true });
            }

            await db.execute("UPDATE games SET player2_id = ?, status = 'active' WHERE id = ?", [userId, game.id]);
            await db.execute("UPDATE users SET current_game_id = ? WHERE discord_id IN (?, ?)", [game.id, userId, game.player1_id]);

            await interaction.reply({ content: `You have joined a game against another player! The battle will begin shortly.`, ephemeral: true });
            // We can notify the other player as well
            const otherPlayer = await interaction.client.users.fetch(game.player1_id);
            otherPlayer.send(`Your game is starting! You are playing against ${interaction.user.tag}.`);

        } else {
            // 4. Create a new game
            const [newGame] = await db.execute('INSERT INTO games (player1_id) VALUES (?)', [userId]);
            const gameId = newGame.insertId;
            await db.execute('UPDATE users SET current_game_id = ? WHERE discord_id = ?', [gameId, userId]);

            await interaction.reply({ content: 'You have started a new game! Waiting for another player to join...', ephemeral: true });
        }
    },
};
