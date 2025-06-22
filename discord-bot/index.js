const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();
const db = require('./util/database');
const { sendHeroSelection, sendAbilitySelection, sendWeaponSelection, sendArmorSelection } = require('./managers/DraftManager');
const GameEngine = require('../backend/game/engine');
const { createCombatant } = require('../backend/game/utils');
const { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } = require('../backend/game/data');
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

function createCombatantFromDraft(draftedHero, team, position) {
    if (!draftedHero || !draftedHero.id) return null;
    return createCombatant({
        hero_id: draftedHero.id,
        weapon_id: draftedHero.weapon,
        armor_id: draftedHero.armor,
        ability_id: draftedHero.ability
    }, team, position);
}

function generateRandomChampion() {
    const commonHeroes = allPossibleHeroes.filter(h => h.rarity === 'Common');
    const hero = commonHeroes[Math.floor(Math.random() * commonHeroes.length)];
    const abilityPool = allPossibleAbilities.filter(a => a.class === hero.class && a.rarity === 'Common');
    const ability = abilityPool.length > 0 ? abilityPool[Math.floor(Math.random() * abilityPool.length)] : null;
    const weapon = allPossibleWeapons[Math.floor(Math.random() * allPossibleWeapons.length)];
    const armor = allPossibleArmors[Math.floor(Math.random() * allPossibleArmors.length)];
    return { id: hero.id, ability: ability?.id, weapon: weapon.id, armor: armor.id };
}

function chunkBattleLog(log, chunkSize = 1980) {
    const chunks = [];
    let currentChunk = "";
    for (const line of log) {
        if (currentChunk.length + line.length + 1 > chunkSize) {
            chunks.push(currentChunk);
            currentChunk = "";
        }
        currentChunk += line + "\n";
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    return chunks;
}

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
        await interaction.deferUpdate();
        const customId = interaction.customId;
        const isForfeit = customId.startsWith('forfeit_');
        const isCancel = customId === 'cancel_draft';
        if (isForfeit) {
            const gameIdToForfeit = customId.split('_')[1];
            await db.execute("UPDATE games SET status = 'forfeited' WHERE id = ?", [gameIdToForfeit]);
            await db.execute("UPDATE users SET current_game_id = NULL WHERE discord_id = ?", [interaction.user.id]);
            await interaction.editReply({ embeds: [confirm('Your previous game has been forfeited. Run `/draft` again to start a new one.')], components: [] });
            return;
        }
        if (isCancel) {
            await interaction.editReply({ embeds: [confirm('Draft canceled.')], components: [] });
            return;
        }

        const [sessionId, action, payload] = customId.split(':');
        const session = sessionManager.getSession(sessionId);

        if (!session) {
            return interaction.followUp({ content: 'This draft session has expired.', ephemeral: true });
        }

        try {
            const draftState = session.draftState;

            let heroNumber = !draftState.team.hero1 ? 1 : !draftState.team.hero2 ? 2 : null;

            switch (action) {
                case 'pickHero':
                    if (!heroNumber) break;
                    draftState.team[`hero${heroNumber}`] = { id: parseInt(payload, 10) };
                    session.step = 'choose-ability';
                    await sendAbilitySelection(interaction, session, draftState.team[`hero${heroNumber}`].id);
                    break;

                case 'pickAbility':
                    if (!heroNumber) break;
                    draftState.team[`hero${heroNumber}`].ability = parseInt(payload, 10);
                    session.step = 'choose-weapon';
                    const heroForWeapon = allPossibleHeroes.find(h => h.id === draftState.team[`hero${heroNumber}`].id);
                    if (!heroForWeapon) throw new Error(`Hero not found for ID: ${draftState.team[`hero${heroNumber}`].id}`);
                    await sendWeaponSelection(interaction, session, heroForWeapon.name);
                    break;

                case 'pickWeapon':
                    if (!heroNumber) break;
                    draftState.team[`hero${heroNumber}`].weapon = parseInt(payload, 10);
                    session.step = 'choose-armor';
                    const heroForArmor = allPossibleHeroes.find(h => h.id === draftState.team[`hero${heroNumber}`].id);
                    if (!heroForArmor) throw new Error(`Hero not found for ID: ${draftState.team[`hero${heroNumber}`].id}`);
                    await sendArmorSelection(interaction, session, heroForArmor.name);
                    break;

                case 'pickArmor':
                    if (!heroNumber) break;
                    draftState.team[`hero${heroNumber}`].armor = parseInt(payload, 10);

                    if (heroNumber === 1) {
                        session.step = 'choose-hero';
                        await interaction.editReply({ embeds: [simple('First Champion Assembled!')], components: [] });
                        await sendHeroSelection(interaction, session);
                    } else {
                        session.step = 'complete';
                        await interaction.editReply({ embeds: [simple('Team Assembled! Simulating battle...')], components: [] });

                        const enemyChampion1 = generateRandomChampion();
                        let enemyChampion2 = generateRandomChampion();
                        while (enemyChampion2.hero === enemyChampion1.hero) {
                            enemyChampion2 = generateRandomChampion();
                        }

                        const playerTeam = draftState.team;
                        const combatants = [
                            createCombatantFromDraft(playerTeam.hero1, 'player', 0),
                            createCombatantFromDraft(playerTeam.hero2, 'player', 1),
                            createCombatantFromDraft(enemyChampion1, 'enemy', 0),
                            createCombatantFromDraft(enemyChampion2, 'enemy', 1)
                        ].filter(Boolean);

                        const gameInstance = new GameEngine(combatants);
                        const battleLog = gameInstance.runFullGame();

                        const logChunks = chunkBattleLog(battleLog);
                        for (const chunk of logChunks) {
                            await interaction.followUp({ embeds: [simple('Battle Log', [{ name: 'Turn-by-Turn', value: `\`\`\`${chunk}\`\`\`` }])], ephemeral: true });
                        }

                        sessionManager.deleteSession(sessionId);
                    }
                    break;
            }

            if (session.step !== 'complete') {
                await db.execute('UPDATE games SET draft_state = ? WHERE id = ?', [JSON.stringify(draftState), session.gameId]);
            }

        } catch (error) {
            console.error('Error handling button interaction:', error);
            await interaction.followUp({ embeds: [simple('An error occurred. Please try starting a new draft.')], ephemeral: true }).catch(() => {});
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
