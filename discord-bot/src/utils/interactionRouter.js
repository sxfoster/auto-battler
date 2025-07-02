const userService = require('./userService');

// This function handles interactions for active players.
async function handleActiveInteraction(interaction, user) {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    // Example of location-based check
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
    // Additional active-state component logic could go here
  }
}

// Main router entry point
async function routeInteraction(interaction) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    user = await userService.createUser(interaction.user.id, interaction.user.username);
    await userService.setUserState(interaction.user.id, 'in_tutorial');
    await userService.setTutorialStep(interaction.user.id, 'welcome');
  }

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
