const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();
const db = require('./util/database');
const { simple } = require('./src/utils/embedBuilder');
const {
  allPossibleHeroes,
  allPossibleWeapons,
  allPossibleArmors,
  allPossibleAbilities
} = require('../backend/game/data');
const { createCombatant } = require('../backend/game/utils');
const GameEngine = require('../backend/game/engine');


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


// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
    // --- Slash Command Handler ---
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`, error);
            const replyOptions = { content: 'There was an error executing this command!', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(replyOptions);
            } else {
                await interaction.reply(replyOptions);
            }
        }
        return;
    }

    // --- Selection Menu Handler ---
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'fight_team_select') {
            try {
                await interaction.update({ content: 'Team selected! Preparing the battle...', components: [] });

                const [player_champion_id_1, player_champion_id_2] = interaction.values;

                const [p1_rows] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [player_champion_id_1]);
                const [p2_rows] = await db.execute('SELECT * FROM user_champions WHERE id = ?', [player_champion_id_2]);
                const playerChampion1_db = p1_rows[0];
                const playerChampion2_db = p2_rows[0];

                const aiChampion1 = generateRandomChampion();
                let aiChampion2 = generateRandomChampion();
                while (aiChampion2.id === aiChampion1.id) {
                    aiChampion2 = generateRandomChampion();
                }

                const combatants = [
                    createCombatant({ hero_id: playerChampion1_db.base_hero_id, weapon_id: playerChampion1_db.equipped_weapon_id, armor_id: playerChampion1_db.equipped_armor_id, ability_id: playerChampion1_db.equipped_ability_id }, 'player', 0),
                    createCombatant({ hero_id: playerChampion2_db.base_hero_id, weapon_id: playerChampion2_db.equipped_weapon_id, armor_id: playerChampion2_db.equipped_armor_id, ability_id: playerChampion2_db.equipped_ability_id }, 'player', 1),
                    createCombatant({ hero_id: aiChampion1.id, weapon_id: aiChampion1.weapon, armor_id: aiChampion1.armor, ability_id: aiChampion1.ability }, 'enemy', 0),
                    createCombatant({ hero_id: aiChampion2.id, weapon_id: aiChampion2.weapon, armor_id: aiChampion2.armor, ability_id: aiChampion2.ability }, 'enemy', 1)
                ].filter(Boolean);

                if (combatants.length < 4) {
                    throw new Error('Failed to create all combatants for the battle. Check if all hero IDs are valid.');
                }

                const gameInstance = new GameEngine(combatants);
                const battleLog = gameInstance.runFullGame();
                const winner = gameInstance.winner === 'player' ? interaction.user.username : 'AI Opponent';

                await interaction.followUp({ embeds: [simple(`⚔️ Battle Complete! ⚔️`, [{ name: 'Winner', value: winner }])], ephemeral: true });

                const logChunks = chunkBattleLog(battleLog);
                for (const chunk of logChunks) {
                    await interaction.followUp({ content: `\`\`\`${chunk}\`\`\``, ephemeral: true });
                }

            } catch (error) {
                console.error('Error handling fight selection:', error);
                await interaction.followUp({ content: 'An error occurred while starting the battle.', ephemeral: true }).catch(() => {});
            }
        }
        return;
    }
});


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


client.login(process.env.DISCORD_TOKEN);
