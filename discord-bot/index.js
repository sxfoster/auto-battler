const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();
const db = require('./util/database');
const { sendAbilitySelection, sendWeaponSelection } = require('./managers/DraftManager');
const GameEngine = require('../backend/game/engine');
const { createCombatant } = require('../backend/game/utils');
const { allPossibleHeroes } = require('../backend/game/data');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.once(Events.ClientReady, async () => {
    console.log(`✅ Logged in as ${client.user.tag}! The bot is online.`);

    // Test database connection
    try {
        const [rows, fields] = await db.execute('SELECT 1');
        console.log('✅ Database connection successful.');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    // Handle Slash Commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            const userId = interaction.user.id;
            const [rows] = await db.execute('SELECT * FROM users WHERE discord_id = ?', [userId]);
            if (rows.length === 0) {
                await db.execute('INSERT INTO users (discord_id) VALUES (?)', [userId]);
                console.log(`New user added: ${interaction.user.tag}`);
            }
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
        return;
    }

    // Handle Button Clicks
    if (interaction.isButton()) {
        const [action, type, gameId, choiceId] = interaction.customId.split('_');

        if (action !== 'draft') return;

        try {
            const [gameRows] = await db.execute('SELECT * FROM games WHERE id = ?', [gameId]);
            if (gameRows.length === 0) {
                return interaction.update({ content: 'This game no longer exists.', components: [] });
            }
            const game = gameRows[0];
            const draftState = JSON.parse(game.draft_state);

            if (type === 'hero' && draftState.stage === 'HERO_SELECTION') {
                draftState.team.hero = parseInt(choiceId, 10);
                draftState.stage = 'ABILITY_SELECTION';
                await db.execute('UPDATE games SET draft_state = ? WHERE id = ?', [JSON.stringify(draftState), gameId]);

                await sendAbilitySelection(interaction, gameId, draftState.team.hero);

            } else if (type === 'ability' && draftState.stage === 'ABILITY_SELECTION') {
                draftState.team.ability = parseInt(choiceId, 10);
                draftState.stage = 'WEAPON_SELECTION';
                await db.execute('UPDATE games SET draft_state = ? WHERE id = ?', [JSON.stringify(draftState), gameId]);

                const hero = allPossibleHeroes.find(h => h.id === draftState.team.hero);
                await sendWeaponSelection(interaction, gameId, hero.name);

            } else if (type === 'weapon' && draftState.stage === 'WEAPON_SELECTION') {
                draftState.team.weapon = parseInt(choiceId, 10);
                draftState.stage = 'DRAFT_COMPLETE';
                await db.execute('UPDATE games SET draft_state = ? WHERE id = ?', [JSON.stringify(draftState), gameId]);

                await interaction.update({ content: 'Draft complete! Simulating battle...', components: [] });

                const playerData = { discord_id: game.player1_id, hero_id: draftState.team.hero, weapon_id: draftState.team.weapon, ability_id: draftState.team.ability };
                const aiData = { discord_id: 'AI', hero_id: 301, weapon_id: 1201, armor_id: null, ability_id: null };

                const playerCombatant = createCombatant(playerData, 'player', 0);
                const aiCombatant = createCombatant(aiData, 'enemy', 0);

                const gameInstance = new GameEngine([playerCombatant, aiCombatant]);
                const battleLog = gameInstance.runFullGame();
                const winnerId = gameInstance.winner === 'player' ? game.player1_id : 'AI';

                await db.execute("UPDATE games SET status = 'complete', winner_id = ? WHERE id = ?", [winnerId, gameId]);
                await db.execute("UPDATE users SET current_game_id = NULL WHERE discord_id = ?", [game.player1_id]);

                const logText = battleLog.join('\n');
                const resultMessage = `**Battle Complete!**\n**Winner:** ${winnerId === 'AI' ? 'AI Opponent' : `<@${game.player1_id}>`}\n\n**Final Roster:**\n<@${game.player1_id}>: ${gameInstance.combatants[0].currentHp}/${gameInstance.combatants[0].maxHp} HP\nAI Opponent: ${gameInstance.combatants[1].currentHp}/${gameInstance.combatants[1].maxHp} HP\n\n**Battle Log:**\n\`\`\`\n${logText}\n\`\`\``;

                await interaction.followUp({ content: resultMessage });
            }
        } catch (error) {
            console.error('Error handling button interaction:', error);
            await interaction.update({ content: 'An error occurred while processing your selection.', components: [] });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
