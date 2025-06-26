const { REST, Routes } = require('discord.js');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandDirs = [
  path.join(__dirname, 'commands/ping.js'),
  path.join(__dirname, 'src/commands/game.js')
];

console.log('Registering slash commands:', commandDirs.map(f => path.basename(f)).join(', '));

for (const filePath of commandDirs) {
  const command = require(filePath);
  console.log(`Loading command: ${command.data.name}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
