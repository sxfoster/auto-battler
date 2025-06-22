const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const db = require('../util/database');
const { allPossibleHeroes } = require('../../backend/game/data');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('draft')
        .setDescription('Starts a new game by drafting your team.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        // 1. Check if the user is already in a game
        const [userRows] = await db.execute('SELECT current_game_id FROM users WHERE discord_id = ?', [userId]);
        if (userRows[0] && userRows[0].current_game_id) {
            return interaction.reply({ content: 'You are already in a game! Finish or forfeit that one first.', ephemeral: true });
        }

        await interaction.reply({ content: 'Your draft is starting! Please check your Direct Messages.', ephemeral: true });

        // 2. Create a new game and draft record
        const initialDraftState = {
            stage: 'HERO_SELECTION',
            team: {
                hero: null,
                weapon: null,
                ability: null
            }
        };

        const [newGame] = await db.execute(
            "INSERT INTO games (player1_id, status, draft_state) VALUES (?, 'drafting', ?)",
            [userId, JSON.stringify(initialDraftState)]
        );
        const gameId = newGame.insertId;

        await db.execute('UPDATE users SET current_game_id = ? WHERE discord_id = ?', [gameId, userId]);

        // 3. Generate Hero Choices
        const shuffledHeroes = [...allPossibleHeroes].sort(() => 0.5 - Math.random());
        const heroChoices = shuffledHeroes.slice(0, 4);

        // 4. Build the Interactive Message (Embed + Buttons)
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Hero Selection')
            .setDescription('Choose the first hero for your team.')
            .setTimestamp();

        const buttons = heroChoices.map(hero => {
            return new ButtonBuilder()
                .setCustomId(`draft_hero_${gameId}_${hero.id}`)
                .setLabel(hero.name)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('👤');
        });

        const actionRow = new ActionRowBuilder().addComponents(buttons);

        // 5. Send the choices to the user's DMs
        try {
            await interaction.user.send({
                content: `Game #${gameId}: It's time to draft!`,
                embeds: [embed],
                components: [actionRow]
            });
        } catch (error) {
            console.error(`Could not send DM to ${interaction.user.tag}.`);
            await db.execute('DELETE FROM games WHERE id = ?', [gameId]);
            await db.execute('UPDATE users SET current_game_id = NULL WHERE discord_id = ?', [userId]);
            await interaction.followUp({ content: "I couldn't send you a DM! Please check your privacy settings to allow DMs from this server.", ephemeral: true });
        }
    }
};
