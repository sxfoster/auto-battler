const { Client, Collection, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./util/config');
const gameData = require('./util/gameData');
const userService = require('./src/utils/userService');
const settingsCommand = require('./commands/settings');
const abilityCardService = require('./src/utils/abilityCardService');
const { allPossibleAbilities } = require('../backend/game/data');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const inventoryHandlers = require('./commands/inventory');
const invViewHandlers = require('./src/utils/inventoryHandlers');
const challengeHandlers = require('./src/commands/challenge');
const auctionHandlers = require('./src/utils/auctionHouseHandlers');

const commandDirs = [
  path.join(__dirname, 'commands'),
  path.join(__dirname, 'src/commands')
];

for (const dir of commandDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const command = require(path.join(dir, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  await gameData.loadAllData();
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    let user = await userService.getUser(interaction.user.id);
    if (!user) {
      await userService.createUser(interaction.user.id, interaction.user.username);
      user = await userService.getUser(interaction.user.id);
    }

    if (interaction.commandName !== 'tutorial' && !user.tutorial_completed) {
      const tut = client.commands.get('tutorial');
      if (tut) {
        await tut.execute(interaction);
      } else {
        await interaction.reply({ content: 'Tutorial unavailable.', ephemeral: true });
      }
      return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        `Error executing ${interaction.commandName}`,
        {
          interactionId: interaction.id,
          userId: interaction.user?.id,
          error
        }
      );
      const replyOptions = { content: 'There was an error executing this command!', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyOptions);
      } else {
        await interaction.reply(replyOptions);
      }
    }
  } else if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (command && typeof command.autocomplete === 'function') {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(`Error handling autocomplete for ${interaction.commandName}`, error);
      }
    }
  } else if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'ability-select') {
      await inventoryHandlers.handleAbilitySelect(interaction);
    } else if (interaction.customId === 'equip-card') {
      await inventoryHandlers.handleEquipSelect(interaction);
    } else if (interaction.customId === 'weapon-select') {
      await inventoryHandlers.handleWeaponSelect(interaction);
    } else if (interaction.customId === 'merge-ability-select') {
      await inventoryHandlers.handleMergeSelect(interaction);
    } else if (interaction.customId === 'ah-sell-select') {
      await auctionHandlers.handleSellSelect(interaction);
    } else if (interaction.customId === 'ah-buy-select') {
      await auctionHandlers.handleBuySelect(interaction);
    }
  } else if (interaction.isButton()) {
    const [customId, targetUserId] = interaction.customId.split(':');

    if (targetUserId && interaction.user.id !== targetUserId) {
      return interaction.reply({ content: "This isn't your adventure!", ephemeral: true });
    }

    if (customId === 'continue-adventure') {
      await interaction.update({ content: 'Delving deeper into the caves...', components: [] });
      const command = client.commands.get('adventure');
      if (command) {
        await command.execute(interaction);
      }
    } else if (customId === 'back-to-town') {
      const townCommand = client.commands.get('town');
      if (townCommand) {
        await townCommand.execute(interaction);
      }
    } else if (customId === 'inventory-equip-start') {
      await inventoryHandlers.handleEquipButton(interaction);
    } else if (interaction.customId === 'inventory-merge-start') {
      await inventoryHandlers.handleMergeButton(interaction);
    } else if (interaction.customId === 'set-ability') {
      await inventoryHandlers.handleSetAbilityButton(interaction);
    } else if (interaction.customId === 'set-weapon') {
      await inventoryHandlers.handleSetWeaponButton(interaction);
    } else if (interaction.customId === 'inv-view-abilities') {
      await invViewHandlers.showAbilities(interaction);
    } else if (interaction.customId === 'inv-view-weapons') {
      await invViewHandlers.showWeapons(interaction);
    } else if (interaction.customId.startsWith('challenge-accept:')) {
      await challengeHandlers.handleAccept(interaction);
    } else if (interaction.customId.startsWith('challenge-decline:')) {
      await challengeHandlers.handleDecline(interaction);
    } else if (interaction.customId.startsWith('open-inventory:')) {
      const inventoryCommand = client.commands.get('inventory');
      interaction.options = { getSubcommand: () => 'show' };
      await inventoryCommand.execute(interaction);
    } else if (interaction.customId === 'tutorial_auctionhouse') {
      const tutorial = client.commands.get('tutorial');
      const state = tutorial?.tutorialState.get(interaction.user.id) || {};
      const common = allPossibleAbilities.filter(a => a.rarity === 'Common');
      const ability = common[Math.floor(Math.random() * common.length)];
      state.ability = ability;
      state.step = 'auction';
      tutorial?.tutorialState.set(interaction.user.id, state);
      await userService.addGold(interaction.user.id, 5);
      const embed = new EmbedBuilder()
        .setTitle('Edgar Pain')
        .setDescription(`I have slipped 5 gold into your pocket. Purchase this card: **${ability.name}**.`);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tutorial_purchase_card').setLabel('Purchase').setStyle(ButtonStyle.Primary)
      );
      await interaction.update({ embeds: [embed], components: [row] });
    } else if (interaction.customId === 'tutorial_purchase_card') {
      const tutorial = client.commands.get('tutorial');
      const state = tutorial?.tutorialState.get(interaction.user.id);
      if (!state?.ability) return;
      const user = await userService.getUser(interaction.user.id);
      const cardId = await abilityCardService.addCard(user.id, state.ability.id, 40);
      state.cardId = cardId;
      state.step = 'inventory';
      tutorial.tutorialState.set(interaction.user.id, state);
      const embed = new EmbedBuilder()
        .setTitle('Card Purchased')
        .setDescription(`You bought **${state.ability.name}**. Let's see it in your inventory.`);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tutorial_open_inventory').setLabel('Open Inventory').setStyle(ButtonStyle.Primary)
      );
      await interaction.update({ embeds: [embed], components: [row] });
    } else if (interaction.customId === 'tutorial_open_inventory') {
      const tutorial = client.commands.get('tutorial');
      const state = tutorial?.tutorialState.get(interaction.user.id);
      if (!state?.cardId) return;
      const cards = await abilityCardService.getCards((await userService.getUser(interaction.user.id)).id);
      const card = cards.find(c => c.id === state.cardId);
      const ability = allPossibleAbilities.find(a => a.id === card.ability_id);
      const embed = new EmbedBuilder()
        .setTitle('Inventory')
        .setDescription(`In your backpack you see **${ability.name}**.`);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`tutorial_equip_card:${card.id}`).setLabel('Equip').setStyle(ButtonStyle.Primary)
      );
      await interaction.update({ embeds: [embed], components: [row] });
    } else if (interaction.customId.startsWith('tutorial_equip_card:')) {
      const cardId = parseInt(interaction.customId.split(':')[1], 10);
      await userService.setActiveAbility(interaction.user.id, cardId);
      const tutorial = client.commands.get('tutorial');
      const state = tutorial?.tutorialState.get(interaction.user.id) || {};
      state.step = 'battle';
      tutorial?.tutorialState.set(interaction.user.id, state);
      const embed = new EmbedBuilder()
        .setTitle('Ready for Adventure')
        .setDescription('Excellent choice. Let us test your mettle.');
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tutorial_start_adventure').setLabel('Begin').setStyle(ButtonStyle.Success)
      );
      await interaction.update({ embeds: [embed], components: [row] });
    } else if (interaction.customId === 'tutorial_start_adventure') {
      const tutorial = client.commands.get('tutorial');
      const state = tutorial?.tutorialState.get(interaction.user.id);
      if (!state?.ability) return;
      await tutorial.runTutorial(interaction, state.ability.class);
    } else if (interaction.customId === 'tutorial_select_tank') {
      await interaction.update({ content: 'You have chosen the path of the Stalwart Defender!', components: [] });
      const tutorial = client.commands.get('tutorial');
      if (tutorial && typeof tutorial.runTutorial === 'function') {
        await tutorial.runTutorial(interaction, 'Stalwart Defender');
      }
    } else if (interaction.customId === 'tutorial_select_dps') {
      await interaction.update({ content: 'You have chosen the path of the Raging Fighter!', components: [] });
      const tutorial = client.commands.get('tutorial');
      if (tutorial && typeof tutorial.runTutorial === 'function') {
        await tutorial.runTutorial(interaction, 'Raging Fighter');
      }
    } else if (interaction.customId === 'tutorial_select_healer') {
      await interaction.update({ content: 'You have chosen the path of the Divine Healer!', components: [] });
      const tutorial = client.commands.get('tutorial');
      if (tutorial && typeof tutorial.runTutorial === 'function') {
        await tutorial.runTutorial(interaction, 'Divine Healer');
      }
    } else if (interaction.customId === 'tutorial_select_support') {
      await interaction.update({ content: 'You have chosen the path of the Inspiring Artist!', components: [] });
      const tutorial = client.commands.get('tutorial');
      if (tutorial && typeof tutorial.runTutorial === 'function') {
        await tutorial.runTutorial(interaction, 'Inspiring Artist');
      }
    } else if (interaction.customId === 'tutorial_loot_goblin') {
      const tutorial = client.commands.get('tutorial');
      const loot = tutorial?.tutorialLoot.get(interaction.user.id);
      const items = [];
      if (loot?.weapon) items.push(loot.weapon);
      if (loot?.ability) items.push(loot.ability + ' ability card');
      const lootDesc = items.length
        ? `You search the goblin's crude burlap sack and find ${items.join(' and ')}.`
        : 'The goblin carried nothing of value.';
      const embed = new EmbedBuilder()
        .setTitle('Loot Acquired!')
        .setDescription(lootDesc);
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('tutorial_go_to_town')
          .setLabel('Go to Town')
          .setStyle(ButtonStyle.Primary)
      );
      await interaction.update({ embeds: [embed], components: [row] });
    } else if (interaction.customId === 'tutorial_go_to_town') {
      const townCommand = client.commands.get('town');
      if (townCommand) {
        await townCommand.execute(interaction);
      }
      const tutorial = client.commands.get('tutorial');
      tutorial?.tutorialLoot.delete(interaction.user.id);
      await userService.markTutorialComplete(interaction.user.id);
    } else if (interaction.customId.startsWith('proceed-battle:')) {
      await interaction.update({ content: 'Proceeding to battle...', components: [] });
      const adventureCommand = client.commands.get('adventure');
      interaction.bypassChargeCheck = true;
      await adventureCommand.execute(interaction);
    } else if (interaction.customId === 'ah-sell-start') {
      await auctionHandlers.handleSellButton(interaction);
    } else if (interaction.customId === 'ah-buy-start') {
      await auctionHandlers.handleBuyButton(interaction);
    } else if (interaction.customId === 'town-adventure') {
      const adventureCommand = client.commands.get('adventure');
      if (adventureCommand) {
        await interaction.deferUpdate();
        await adventureCommand.execute(interaction);
      }
    } else if (interaction.customId === 'town-inventory') {
      const inventoryCommand = client.commands.get('inventory');
      if (inventoryCommand) {
        interaction.options = { getSubcommand: () => 'show' };
        await inventoryCommand.execute(interaction);
      }
    } else if (interaction.customId === 'town-leaderboard') {
      const leaderboardCommand = client.commands.get('leaderboard');
      if (leaderboardCommand) {
        await leaderboardCommand.execute(interaction);
      }
    } else if (interaction.customId === 'town-auctionhouse') {
      const auctionhouseCommand = client.commands.get('auctionhouse');
      if (auctionhouseCommand) {
        await auctionhouseCommand.execute(interaction);
      }
    } else if (interaction.customId === 'nav-town') {
      const townCommand = client.commands.get('town');
      if (townCommand) {
        await townCommand.execute(interaction);
      }
    } else if (interaction.customId === 'toggle_battle_logs') {
      const user = await userService.getUser(interaction.user.id);
      const newValue = !user.dm_battle_logs_enabled;
      await userService.setDmPreference(
        interaction.user.id,
        'dm_battle_logs_enabled',
        newValue
      );
      user.dm_battle_logs_enabled = newValue;
      await interaction.update(settingsCommand.buildSettingsResponse(user));
    } else if (interaction.customId === 'toggle_item_drops') {
      const user = await userService.getUser(interaction.user.id);
      const newValue = !user.dm_item_drops_enabled;
      await userService.setDmPreference(
        interaction.user.id,
        'dm_item_drops_enabled',
        newValue
      );
      user.dm_item_drops_enabled = newValue;
      await interaction.update(settingsCommand.buildSettingsResponse(user));
    } else if (interaction.customId === 'cycle_log_verbosity') {
      const user = await userService.getUser(interaction.user.id);
      const order = ['summary', 'detailed', 'combat_only'];
      const idx = order.indexOf(user.log_verbosity || 'summary');
      const next = order[(idx + 1) % order.length];
      await userService.setLogVerbosity(interaction.user.id, next);
      user.log_verbosity = next;
      await interaction.update(settingsCommand.buildSettingsResponse(user));
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith('ah-sell-modal:')) {
      await auctionHandlers.handleSellModal(interaction);
    }
  }
});

client.login(config.DISCORD_TOKEN);
