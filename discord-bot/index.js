const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();
const db = require('./util/database');
const { sendAbilitySelection, sendWeaponSelection } = require('./managers/DraftManager');
const GameEngine = require('../backend/game/engine');
const { createCombatant } = require('../backend/game/utils');
const { allPossibleHeroes } = require('../backend/game/data');
const { simple } = require('./src/utils/embedBuilder');
const confirm = require('./src/utils/confirm');
const sessionManager = require('./sessionManager');

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
            await interaction.reply({ embeds: [simple('There was an error executing this command!')], ephemeral: true });
        }
        return;
    }

    // Handle Button Clicks
    if (interaction.isButton()) {
        const userId = interaction.user.id;
        const customId = interaction.customId;
        const isForfeit = customId.startsWith('forfeit_');
        const isCancel = customId === 'cancel_draft';
        const [sessionId, action, payload] = customId.split(':');
        const session = sessionManager.getSession(sessionId);

        try {
            if (isForfeit) {
                await interaction.deferUpdate();
                const gameIdToForfeit = customId.split('_')[1];
                await db.execute("UPDATE games SET status = 'forfeited' WHERE id = ?", [gameIdToForfeit]);
                await db.execute("UPDATE users SET current_game_id = NULL WHERE discord_id = ?", [userId]);
                await interaction.update({ embeds: [confirm('Your previous game has been forfeited. Run `/draft` again to start a new one.')], components: [] });

            } else if (isCancel) {
                // Defer first to avoid InteractionFailed errors if processing takes too long
                await interaction.deferUpdate();
                await interaction.editReply({ embeds: [confirm('Draft canceled.')], components: [] });
            } else if (session) {
                await interaction.deferUpdate();
                const draftState = session.draftState;

                if (session.step === 'choose-hero' && action === 'pickHero') {
                    draftState.team.hero = parseInt(payload, 10);
                    draftState.stage = 'ABILITY_SELECTION';
                    session.step = 'choose-ability';
                    await db.execute('UPDATE games SET draft_state = ? WHERE id = ?', [JSON.stringify(draftState), session.gameId]);
                    await sendAbilitySelection(interaction, session, draftState.team.hero);

                } else if (session.step === 'choose-ability' && action === 'pickAbility') {
                    draftState.team.ability = parseInt(payload, 10);
                    draftState.stage = 'WEAPON_SELECTION';
                    session.step = 'choose-weapon';
                    await db.execute('UPDATE games SET draft_state = ? WHERE id = ?', [JSON.stringify(draftState), session.gameId]);
                    const hero = allPossibleHeroes.find(h => h.id === draftState.team.hero);
                    await sendWeaponSelection(interaction, session, hero.name);

                } else if (session.step === 'choose-weapon' && action === 'pickWeapon') {
                    draftState.team.weapon = parseInt(payload, 10);
                    draftState.stage = 'DRAFT_COMPLETE';
                    session.step = 'complete';
                    await db.execute('UPDATE games SET draft_state = ? WHERE id = ?', [JSON.stringify(draftState), session.gameId]);
                    await interaction.editReply({ embeds: [simple('Draft complete! Simulating battle...')], components: [] });

                    const heroName = allPossibleHeroes.find(h => h.id === draftState.team.hero).name;
                    const selectedHeroes = [heroName];
                    const buffer = await require('./src/utils/imageGen').makeTeamImage(selectedHeroes);
                    const fields = [{ name: 'Heroes', value: selectedHeroes.join(', ') }];
                    await interaction.followUp({
                        embeds: [simple('Your Drafted Team', fields)],
                        files: [{ attachment: buffer, name: 'team.png' }]
                    });

                    const playerData = { discord_id: session.userId, hero_id: draftState.team.hero, weapon_id: draftState.team.weapon, ability_id: draftState.team.ability };
                    const aiData = { discord_id: 'AI', hero_id: 301, weapon_id: 1201, armor_id: null, ability_id: null };
                    const playerCombatant = createCombatant(playerData, 'player', 0);
                    const aiCombatant = createCombatant(aiData, 'enemy', 0);
                    const gameInstance = new GameEngine([playerCombatant, aiCombatant]);
                    const battleLog = gameInstance.runFullGame();
                    const winnerId = gameInstance.winner === 'player' ? session.userId : 'AI';

                    await db.execute("UPDATE games SET status = 'complete', winner_id = ? WHERE id = ?", [winnerId, session.gameId]);
                    await db.execute("UPDATE users SET current_game_id = NULL WHERE discord_id = ?", [session.userId]);

                    const logText = battleLog.join('\n');
                    const resultMessage = `**Battle Complete!**\n**Winner:** ${winnerId === 'AI' ? 'AI Opponent' : `<@${session.userId}>`}\n\n**Final Roster:**\n<@${session.userId}>: ${gameInstance.combatants[0].currentHp}/${gameInstance.combatants[0].maxHp} HP\nAI Opponent: ${gameInstance.combatants[1].currentHp}/${gameInstance.combatants[1].maxHp} HP\n\n**Battle Log:**\n\`\`\`\n${logText}\n\`\`\``;
                    await interaction.followUp({ embeds: [simple('Battle Results', [{ name: 'Summary', value: resultMessage }])] });
                    sessionManager.deleteSession(sessionId);
                }
            }
        } catch (error) {
            console.error('Error handling button interaction:', error);
            await interaction.update({ embeds: [simple('An error occurred while processing your selection.')], components: [] }).catch(() => {});
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
