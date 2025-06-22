const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();
const db = require('./util/database');


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
            await interaction.update({ content: 'Team selected! Preparing the battle...', components: [] });

            const [champion1_id, champion2_id] = interaction.values;

            const [p1_rows] = await db.execute('SELECT h.name FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.id = ?', [champion1_id]);
            const [p2_rows] = await db.execute('SELECT h.name FROM user_champions uc JOIN heroes h ON uc.base_hero_id = h.id WHERE uc.id = ?', [champion2_id]);

            const selectedChampion1 = p1_rows[0];
            const selectedChampion2 = p2_rows[0];

            await interaction.followUp({
                content: `You have selected ${selectedChampion1.name} and ${selectedChampion2.name}! The battle will begin shortly.`,
                ephemeral: true
            });
            // In the future, the battle simulation logic will go here.
        }
        return;
    }
});


client.login(process.env.DISCORD_TOKEN);
