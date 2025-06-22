const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();
const db = require('./util/database');
const { sendHeroSelection, sendAbilitySelection, sendWeaponSelection, sendArmorSelection } = require('./managers/DraftManager');
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

                const heroKey = !draftState.team.hero1 ? 'hero1' : 'hero2';
                const weaponKey = `${heroKey}_weapon`;
                const abilityKey = `${heroKey}_ability`;
                const armorKey = `${heroKey}_armor`;

                switch (action) {
                    case 'pickHero':
                        draftState.team[heroKey] = parseInt(payload, 10);
                        session.step = 'choose-ability';
                        await sendAbilitySelection(interaction, session, draftState.team[heroKey]);
                        break;

                    case 'pickAbility':
                        draftState.team[abilityKey] = parseInt(payload, 10);
                        session.step = 'choose-weapon';
                        const heroForWeapon = allPossibleHeroes.find(h => h.id === draftState.team[heroKey]);
                        if (!heroForWeapon) {
                            console.error(`Could not find hero with ID: ${draftState.team[heroKey]}`);
                            await interaction.followUp({
                                embeds: [simple('Error: Could not find the selected hero data.')],
                                ephemeral: true,
                            });
                            break;
                        }
                        await sendWeaponSelection(interaction, session, heroForWeapon.name);
                        break;

                    case 'pickWeapon':
                        draftState.team[weaponKey] = parseInt(payload, 10);
                        session.step = 'choose-armor';
                        const heroForArmor = allPossibleHeroes.find(h => h.id === draftState.team[heroKey]);
                        if (!heroForArmor) {
                            console.error(`Could not find hero with ID: ${draftState.team[heroKey]}`);
                            await interaction.followUp({
                                embeds: [simple('Error: Could not find the selected hero data.')],
                                ephemeral: true,
                            });
                            break;
                        }
                        await sendArmorSelection(interaction, session, heroForArmor.name);
                        break;

                    case 'pickArmor':
                        draftState.team[armorKey] = parseInt(payload, 10);

                        if (heroKey === 'hero1') {
                            session.step = 'choose-hero';
                            await interaction.editReply({ content: 'First hero draft complete! Now for the second hero.', components: [] });
                            await sendHeroSelection(interaction, session);
                        } else {
                            session.step = 'complete';
                            draftState.stage = 'DRAFT_COMPLETE';
                            await interaction.editReply({ embeds: [simple('Draft complete! Simulating battle...')], components: [] });

                            const heroObj1 = allPossibleHeroes.find(h => h.id === draftState.team.hero1);
                            const heroObj2 = allPossibleHeroes.find(h => h.id === draftState.team.hero2);

                            if (!heroObj1 || !heroObj2) {
                                console.error(`Could not find hero data for IDs: ${draftState.team.hero1}, ${draftState.team.hero2}`);
                                await interaction.followUp({
                                    embeds: [simple('Error: Could not find the selected hero data.')],
                                    ephemeral: true,
                                });
                                break;
                            }

                            const heroName1 = heroObj1.name;
                            const heroName2 = heroObj2.name;
                            const selectedHeroes = [heroName1, heroName2];
                            const buffer = await require('./src/utils/imageGen').makeTeamImage(selectedHeroes);
                            const fields = [{ name: 'Heroes', value: selectedHeroes.join(', ') }];
                            await interaction.followUp({
                                embeds: [simple('Your Drafted Team', fields)],
                                files: [{ attachment: buffer, name: 'team.png' }]
                            });

                            const playerData1 = { discord_id: session.userId, hero_id: draftState.team.hero1, weapon_id: draftState.team.hero1_weapon, armor_id: draftState.team.hero1_armor, ability_id: draftState.team.hero1_ability };
                            const playerData2 = { discord_id: session.userId, hero_id: draftState.team.hero2, weapon_id: draftState.team.hero2_weapon, armor_id: draftState.team.hero2_armor, ability_id: draftState.team.hero2_ability };
                            const aiData1 = { discord_id: 'AI', hero_id: 301, weapon_id: 1201, armor_id: null, ability_id: null };
                            const aiData2 = { discord_id: 'AI', hero_id: 401, weapon_id: 1301, armor_id: null, ability_id: null };
                            const playerCombatant1 = createCombatant(playerData1, 'player', 0);
                            const playerCombatant2 = createCombatant(playerData2, 'player', 1);
                            const aiCombatant1 = createCombatant(aiData1, 'enemy', 0);
                            const aiCombatant2 = createCombatant(aiData2, 'enemy', 1);
                            const gameInstance = new GameEngine([playerCombatant1, playerCombatant2, aiCombatant1, aiCombatant2]);
                            const battleLog = gameInstance.runFullGame();
                            const winnerId = gameInstance.winner === 'player' ? session.userId : 'AI';

                            await db.execute("UPDATE games SET status = 'complete', winner_id = ? WHERE id = ?", [winnerId, session.gameId]);
                            await db.execute("UPDATE users SET current_game_id = NULL WHERE discord_id = ?", [session.userId]);

                            const logText = battleLog.join('\n');
                            const resultMessage = `**Battle Complete!**\n**Winner:** ${winnerId === 'AI' ? 'AI Opponent' : `<@${session.userId}>`}\n\n**Final Roster:**\n<@${session.userId}> Hero1: ${gameInstance.combatants[0].currentHp}/${gameInstance.combatants[0].maxHp} HP\n<@${session.userId}> Hero2: ${gameInstance.combatants[1].currentHp}/${gameInstance.combatants[1].maxHp} HP\nAI Opponent Hero1: ${gameInstance.combatants[2].currentHp}/${gameInstance.combatants[2].maxHp} HP\nAI Opponent Hero2: ${gameInstance.combatants[3].currentHp}/${gameInstance.combatants[3].maxHp} HP\n\n**Battle Log:**\n\`\`\`\n${logText}\n\`\`\``;
                            await interaction.followUp({ embeds: [simple('Battle Results', [{ name: 'Summary', value: resultMessage }])] });
                            sessionManager.deleteSession(sessionId);
                        }
                        break;
                }
                await db.execute('UPDATE games SET draft_state = ? WHERE id = ?', [JSON.stringify(draftState), session.gameId]);
            }
            } catch (error) {
                console.error('Error handling button interaction:', error);
                await interaction.followUp({
                    embeds: [simple('An error occurred while processing your selection.')],
                    components: [],
                    ephemeral: true,
                }).catch(() => {});
            }
    }
});

client.login(process.env.DISCORD_TOKEN);
