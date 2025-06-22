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

// Handle slash commands separately from button interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {
        const userId = interaction.user.id;
        const [rows] = await db.execute('SELECT * FROM users WHERE discord_id = ?', [userId]);
        if (rows.length === 0) {
            await db.execute('INSERT INTO users (discord_id, summoning_shards) VALUES (?, 0)', [userId]);
        }

        if (interaction.commandName === 'summon') {
            const SHARD_COST = 10;
            const userShards = rows[0] ? rows[0].summoning_shards : 0;
            if (userShards < SHARD_COST) {
                return interaction.reply({ content: `You don't have enough summoning shards! You need ${SHARD_COST}.`, ephemeral: true });
            }

            await db.execute('UPDATE users SET summoning_shards = summoning_shards - ? WHERE discord_id = ?', [SHARD_COST, userId]);

            const roll = Math.random();
            let rarity = 'Common';
            if (roll < 0.005) rarity = 'Epic';
            else if (roll < 0.05) rarity = 'Rare';
            else if (roll < 0.30) rarity = 'Uncommon';

            const possibleHeroes = allPossibleHeroes.filter(h => h.rarity === rarity);
            const summonedHero = possibleHeroes[Math.floor(Math.random() * possibleHeroes.length)];

            await db.execute('INSERT INTO user_champions (user_id, base_hero_id) VALUES (?, ?)', [userId, summonedHero.id]);

            const embed = simple(`✨ You Summoned a Champion! ✨`, [
                { name: summonedHero.name, value: `Rarity: ${summonedHero.rarity}\nClass: ${summonedHero.class}` }
            ]);
            await interaction.reply({ embeds: [embed] });
        } else {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute(interaction);
        }
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [simple('There was an error executing this command!')], ephemeral: true }).catch(() => {});
        } else {
            await interaction.reply({ embeds: [simple('There was an error executing this command!')], ephemeral: true }).catch(() => {});
        }
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            const userId = interaction.user.id;
            const [rows] = await db.execute('SELECT * FROM users WHERE discord_id = ?', [userId]);
            if (rows.length === 0) {
                await db.execute('INSERT INTO users (discord_id, soft_currency, hard_currency, summoning_shards) VALUES (?, 0, 0, 0)', [userId]);
            }
            await command.execute(interaction);
        } catch (error) {
            console.error('Error executing command:', error);
            const errEmbed = simple('There was an error executing this command!');
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
            } else {
                await interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
            }
        }
        return;
    }

    if (!interaction.isButton()) return;

    // Acknowledge the interaction immediately.
    await interaction.deferUpdate();

    const [sessionId, action, payload] = interaction.customId.split(':');
    const session = sessionManager.getSession(sessionId);

    if (!session) {
        return interaction.followUp({ content: 'This draft session has expired or is invalid.', ephemeral: true });
    }

    try {
        const draftState = session.draftState;

        // The activeHero property tells us which champion we are building.
        const activeHeroKey = `hero${session.activeHero}`;

        switch (action) {
            case 'pickHero':
                // Determine if we are picking hero 1 or 2.
                const heroNum = !draftState.team.hero1 ? 1 : 2;
                session.activeHero = heroNum; // Set the active hero for the next steps.
                
                draftState.team[`hero${heroNum}`] = { id: parseInt(payload, 10) };
                session.step = 'choose-ability';
                
                await sendAbilitySelection(interaction, session, draftState.team[`hero${heroNum}`].id);
                break;

            case 'pickAbility':
                draftState.team[activeHeroKey].ability = parseInt(payload, 10);
                session.step = 'choose-weapon';

                const heroForWeapon = allPossibleHeroes.find(h => h.id === draftState.team[activeHeroKey].id);
                if (!heroForWeapon) throw new Error(`Hero not found with ID: ${draftState.team[activeHeroKey].id}`);
                
                await sendWeaponSelection(interaction, session, heroForWeapon.name);
                break;

            case 'pickWeapon':
                draftState.team[activeHeroKey].weapon = parseInt(payload, 10);
                session.step = 'choose-armor';

                const heroForArmor = allPossibleHeroes.find(h => h.id === draftState.team[activeHeroKey].id);
                if (!heroForArmor) throw new Error(`Hero not found with ID: ${draftState.team[activeHeroKey].id}`);

                await sendArmorSelection(interaction, session, heroForArmor.name);
                break;

            case 'pickArmor':
                draftState.team[activeHeroKey].armor = parseInt(payload, 10);

                if (session.activeHero === 1) {
                    // First hero complete, start drafting the second.
                    session.step = 'choose-hero'; // Reset step for the next hero draft
                    await interaction.editReply({ embeds: [simple('First Champion Assembled!', [{name: 'Next', value: 'Draft your second champion.'}])], components: [] });
                    await sendHeroSelection(interaction, session);
                } else {
                    // Second hero complete, end draft and start battle.
                    session.step = 'complete';
                    draftState.stage = 'DRAFT_COMPLETE';
                    await interaction.editReply({ embeds: [simple('Team Assembled!', [{name: 'Next', value: 'Simulating battle...'}])], components: [] });

                    // --- BATTLE SIMULATION ---
                    // (This logic can be moved to its own manager later)
                    const playerTeam = draftState.team;
                    const aiTeam = {
                        hero1: generateRandomChampion(),
                        hero2: generateRandomChampion()
                    };
                    // Ensure AI heroes are not the same
                    while (aiTeam.hero2.id === aiTeam.hero1.id) {
                        aiTeam.hero2 = generateRandomChampion();
                    }

                    const combatants = [
                        createCombatant({ hero_id: playerTeam.hero1.id, weapon_id: playerTeam.hero1.weapon, armor_id: playerTeam.hero1.armor, ability_id: playerTeam.hero1.ability }, 'player', 0),
                        createCombatant({ hero_id: playerTeam.hero2.id, weapon_id: playerTeam.hero2.weapon, armor_id: playerTeam.hero2.armor, ability_id: playerTeam.hero2.ability }, 'player', 1),
                        createCombatant({ hero_id: aiTeam.hero1.id, weapon_id: aiTeam.hero1.weapon, armor_id: aiTeam.hero1.armor, ability_id: aiTeam.hero1.ability }, 'enemy', 0),
                        createCombatant({ hero_id: aiTeam.hero2.id, weapon_id: aiTeam.hero2.weapon, armor_id: aiTeam.hero2.armor, ability_id: aiTeam.hero2.ability }, 'enemy', 1)
                    ].filter(Boolean);
                    
                    if (combatants.length !== 4) {
                        throw new Error('Failed to create all combatants for the battle.');
                    }

                    const gameInstance = new GameEngine(combatants);
                    const battleLog = gameInstance.runFullGame();
                    const winnerId = gameInstance.winner === 'player' ? interaction.user.username : 'AI Opponent';
                    
                    await interaction.followUp({ embeds: [simple('⚔️ Battle Complete! ⚔️', [{ name: 'Winner', value: winnerId }])], ephemeral: true });

                    const logChunks = chunkBattleLog(battleLog);
                    for (const chunk of logChunks) {
                         await interaction.followUp({ content: `\`\`\`${chunk}\`\`\``, ephemeral: true });
                    }
                    
                    sessionManager.deleteSession(sessionId);
                }
                break;
        }

        // Persist state to the database after each successful step
        if (session.step !== 'complete') {
            await db.execute('UPDATE games SET draft_state = ? WHERE id = ?', [JSON.stringify(draftState), session.gameId]);
        }

    } catch (error) {
        console.error('Error handling button interaction:', error);
        await interaction.followUp({ embeds: [simple('An error occurred. Please try starting a new draft.')], ephemeral: true }).catch(() => {});
    }
});

client.login(process.env.DISCORD_TOKEN);
