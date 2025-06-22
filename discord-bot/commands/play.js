const GameEngine = require('../../backend/game/engine');
const { createCombatant } = require('../../backend/game/utils');
const db = require('../util/database');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Starts a new single-player game against an AI opponent.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const userTag = interaction.user.tag;

        // 1. Check if the user is already in an active game
        const [userRows] = await db.execute('SELECT current_game_id FROM users WHERE discord_id = ?', [userId]);
        if (userRows[0] && userRows[0].current_game_id) {
            return interaction.reply({ content: 'You are already in a game! Please wait for it to finish.', ephemeral: true });
        }

        await interaction.reply({ content: `Starting a new game for ${userTag}... Simulating the battle now!`, ephemeral: true });

        // 2. Create a new game entry in the database
        const [newGame] = await db.execute("INSERT INTO games (player1_id, status) VALUES (?, 'active')", [userId]);
        const gameId = newGame.insertId;

        // 3. Set the user's current_game_id
        await db.execute('UPDATE users SET current_game_id = ? WHERE discord_id = ?', [gameId, userId]);

        // 4. Set up the player's and AI's teams
        // For now, we'll use mock/default teams. This will be replaced by the draft system later.
        const playerData = { discord_id: userId, hero_id: 101, weapon_id: 1101, armor_id: null, ability_id: null };
        const aiData = { discord_id: 'AI', hero_id: 301, weapon_id: 1201, armor_id: null, ability_id: null };

        const playerCombatant = createCombatant(playerData, 'player', 0);
        const aiCombatant = createCombatant(aiData, 'enemy', 0);

        // 5. Run the game simulation
        const gameInstance = new GameEngine([playerCombatant, aiCombatant]);
        gameInstance.runFullGame();

        const winnerId = gameInstance.winner === 'player' ? userId : 'AI';

        // 6. Update the database with the game's result
        await db.execute("UPDATE games SET status = 'complete', winner_id = ? WHERE id = ?", [winnerId, gameId]);
        await db.execute("UPDATE users SET current_game_id = NULL WHERE discord_id = ?", [userId]);

        // 7. Notify the player of the result
        const resultMessage = `**Battle Complete!**\n**Winner:** ${winnerId === 'AI' ? 'AI Opponent' : `<@${userId}>`}\n\n**Final Roster:**\n<@${userId}>: ${gameInstance.combatants[0].currentHp}/${gameInstance.combatants[0].maxHp} HP\nAI Opponent: ${gameInstance.combatants[1].currentHp}/${gameInstance.combatants[1].maxHp} HP`;

        // Send the result in a public reply or a DM
        await interaction.followUp({ content: resultMessage, ephemeral: false });
    },
};
