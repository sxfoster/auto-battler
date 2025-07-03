const userService = require('./userService');
const settingsCommand = require('../../commands/settings');
const feedback = require('./feedback');

// Handles interactions for active users
async function handleActiveInteraction(interaction, user) {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    if (command.data && command.data.name === 'adventure' && user.location !== 'town') {
      await feedback.sendError(
        interaction,
        'Action Not Available',
        'You must be in town to go on an adventure. Use `/town` to return.'
      );
      return;
    }

    await command.execute(interaction);
  } else if (interaction.isButton()) {
    if (user.location !== 'town' && interaction.customId.startsWith('town-')) {
      await feedback.sendError(
        interaction,
        'Action Not Available',
        'You must be in town to do that. Use `/town` to return.'
      );
      return;
    }

    const [customId, targetUserId] = interaction.customId.split(':');
    if (targetUserId && interaction.user.id !== targetUserId) {
      await feedback.sendError(
        interaction,
        'Action Not Available',
        "This isn't your adventure!"
      );
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
    // --- MODIFICATION START ---
    // New users should skip the tutorial and start in town. The old
    // tutorial logic is kept below in comments for easy reversion.
    user = await userService.createUser(interaction.user.id, interaction.user.username);
    await userService.setUserState(interaction.user.id, 'active');
    await userService.setUserLocation(interaction.user.id, 'town');

    // Greet the user and show them the town command
    const townCommand = interaction.client.commands.get('town');
    if (townCommand) {
      await feedback.sendInfo(
        interaction,
        'Welcome, Adventurer!',
        "You have arrived at Portal's Rest. Use the buttons below to explore."
      );
      return townCommand.execute(interaction);
    }
    // Fallback if town command isn't available
    return feedback.sendInfo(interaction, 'Welcome!', 'Your adventure begins!');

    /*
    // --- OLD TUTORIAL LOGIC (DISABLED) ---
    user = await userService.createUser(interaction.user.id, interaction.user.username);
    await userService.setUserState(interaction.user.id, 'in_tutorial');
    await userService.setTutorialStep(interaction.user.id, 'welcome');

    await feedback.sendInfo(
      interaction,
      'Welcome, Adventurer!',
      "Before you can explore, you need to learn the ropes. Let's start with the tutorial."
    );

    const tutorialCommand = interaction.client.commands.get('tutorial');
    if (tutorialCommand) {
      // Call execute for new users to start the full tutorial flow
      await tutorialCommand.execute(interaction);
    }
    return;
    */
    // --- MODIFICATION END ---
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
      await feedback.sendError(
        interaction,
        'Action Not Available',
        'You cannot perform this action while in combat.'
      );
      break;
    default:
      await feedback.sendError(
        interaction,
        'Unknown State',
        'Your account is in an unknown state. Please contact an administrator.'
      );
  }
}

module.exports = { routeInteraction, handleActiveInteraction };
