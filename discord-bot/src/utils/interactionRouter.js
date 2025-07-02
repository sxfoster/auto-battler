const userService = require('./userService');
const settingsCommand = require('../../commands/settings');

// Handles interactions for active users
async function handleActiveInteraction(interaction, user) {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    if (command.data && command.data.name === 'adventure' && user.location !== 'town') {
      await interaction.reply({ content: 'You must be in town to go on an adventure.', ephemeral: true });
      return;
    }

    await command.execute(interaction);
  } else if (interaction.isButton()) {
    if (user.location !== 'town' && interaction.customId.startsWith('town-')) {
      await interaction.reply({ content: 'You must be in town to do that.', ephemeral: true });
      return;
    }

    const [customId, targetUserId] = interaction.customId.split(':');
    if (targetUserId && interaction.user.id !== targetUserId) {
      await interaction.reply({ content: "This isn't your adventure!", ephemeral: true });
      return;
    }

    if (customId === 'continue-adventure') {
      await interaction.update({ content: 'Delving deeper into the caves...', components: [] });
      const adventureCommand = interaction.client.commands.get('adventure');
      if (adventureCommand) {
        await adventureCommand.execute(interaction);
      }
    } else if (customId === 'back-to-town' || customId === 'nav-town') {
      const townCommand = interaction.client.commands.get('town');
      if (townCommand) {
        await townCommand.execute(interaction);
      }
    } else if (customId === 'toggle_battle_logs') {
      const record = await userService.getUser(interaction.user.id);
      const newValue = !record.dm_battle_logs_enabled;
      await userService.setDmPreference(interaction.user.id, 'dm_battle_logs_enabled', newValue);
      record.dm_battle_logs_enabled = newValue;
      await interaction.update(settingsCommand.buildSettingsResponse(record));
    }
  }
}

// Entry point for all interactions
async function routeInteraction(interaction) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    user = await userService.createUser(interaction.user.id, interaction.user.username);
    await userService.setUserState(interaction.user.id, 'in_tutorial');
    await userService.setTutorialStep(interaction.user.id, 'welcome');
  }

  const state = await userService.getUserState(interaction.user.id);
  user = { ...user, ...state };

  switch (user.state) {
    case 'in_tutorial': {
      const tutorialCommand = interaction.client.commands.get('tutorial');
      if (tutorialCommand && typeof tutorialCommand.handleInteraction === 'function') {
        await tutorialCommand.handleInteraction(interaction, user);
      }
      break;
    }
    case 'active':
      await handleActiveInteraction(interaction, user);
      break;
    case 'in_combat':
      await interaction.reply({ content: 'You are in combat and cannot perform other actions now.', ephemeral: true });
      break;
    default:
      await interaction.reply({ content: 'Your account is in an unknown state. Please contact an administrator.', ephemeral: true });
  }
}

module.exports = { routeInteraction, handleActiveInteraction };
