const { REST, Routes } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');
const config = require('./util/config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandDirs = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'))
  .map(file => path.join(commandsPath, file))
  .filter(filePath => fs.existsSync(filePath));

console.log('Registering slash commands:', commandDirs.map(f => path.basename(f)).join(', '));

for (const filePath of commandDirs) {
  const command = require(filePath);
  console.log(`Loading command: ${command.data.name}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(config.APP_ID, config.GUILD_ID),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
