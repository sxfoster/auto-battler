const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./util/config');
const gameData = require('./util/gameData');

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
    if (interaction.customId === 'inventory-equip-start') {
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
    } else if (interaction.customId.startsWith('proceed-battle:')) {
      await interaction.update({ content: 'Proceeding to battle...', components: [] });
      const adventureCommand = client.commands.get('adventure');
      interaction.bypassChargeCheck = true;
      await adventureCommand.execute(interaction);
    } else if (interaction.customId === 'ah-sell-start') {
      await auctionHandlers.handleSellButton(interaction);
    } else if (interaction.customId === 'ah-buy-start') {
      await auctionHandlers.handleBuyButton(interaction);
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith('ah-sell-modal:')) {
      await auctionHandlers.handleSellModal(interaction);
    }
  }
});

client.login(config.DISCORD_TOKEN);
