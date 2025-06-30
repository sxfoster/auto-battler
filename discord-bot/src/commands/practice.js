const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const userService = require('../utils/userService');
const abilityCardService = require('../utils/abilityCardService');
const { buildBattleEmbed } = require('../utils/embedBuilder');

const MAX_LOG_LINES = 20;
const GameEngine = require('../../../backend/game/engine');
const { createCombatant } = require('../../../backend/game/utils');
const { allPossibleHeroes, allPossibleAbilities } = require('../../../backend/game/data');
const classAbilityMap = require('../data/classAbilityMap');

function respond(interaction, options) {
  if (interaction.deferred || interaction.replied) {
    return interaction.followUp(options);
  }
  return interaction.reply(options);
}

const data = new SlashCommandBuilder()
  .setName('practice')
  .setDescription('Test your skills against a goblin with no risk.');

function formatLog(entry) {
  const prefix = `[R${entry.round}]`;
  let text = entry.message;

  switch (entry.type) {
    case 'round':
      return `\n**--- ${text} ---**\n`;
    case 'ability-cast':
      return `\`\`\`diff\n+ ${prefix} ${text}\n\`\`\``;
    case 'victory':
    case 'defeat':
      return `🏆 **${text}** 🏆`;
    case 'status':
      return `\`\`\`css\n. ${prefix} ${text}\n\`\`\``;
    default:
      return `${prefix} ${text}`;
  }
}

async function execute(interaction) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
    user = await userService.getUser(interaction.user.id);
  }

  const playerClass = classAbilityMap[user.class] || user.class || 'Stalwart Defender';
  const playerHero = allPossibleHeroes.find(h => h.class === playerClass && h.isBase);
  if (!playerHero) {
    await respond(interaction, { content: 'Required hero data missing.', ephemeral: true });
    return;
  }

  // Pick a random base hero for the goblin opponent
  const baseHeroes = allPossibleHeroes.filter(h => h.isBase);
  const goblinBase = baseHeroes[Math.floor(Math.random() * baseHeroes.length)];

  if (!goblinBase) {
    await respond(interaction, { content: 'Required goblin data missing.', ephemeral: true });
    return;
  }

  const cards = await abilityCardService.getCards(user.id);
  const equippedCard = cards.find(c => c.id === user.equipped_ability_id);
  const deck = cards.filter(c => c.id !== user.equipped_ability_id);

  if (!interaction.bypassChargeCheck && equippedCard && equippedCard.charges <= 0) {
    const hasOtherChargedCopy = cards.some(
      c => c.ability_id === equippedCard.ability_id && c.charges > 0
    );

    if (!hasOtherChargedCopy) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`proceed-battle:${interaction.user.id}`)
          .setLabel('Proceed to Battle')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`open-inventory:${interaction.user.id}`)
          .setLabel('Open Inventory')
          .setStyle(ButtonStyle.Secondary)
      );

      const ability = allPossibleAbilities.find(a => a.id === equippedCard.ability_id);
      await interaction.reply({
        content: `⚠️ **Warning!** Your equipped ability, **${ability.name}**, has no charges. You will only be able to use basic attacks.`,
        components: [row],
        ephemeral: true
      });
      return;
    }
  }

  const goblinAbilityPool = allPossibleAbilities
    .filter(a => a.class === goblinBase.class && a.rarity === 'Common');
  const goblinAbilities = goblinAbilityPool.map(a => a.id);

  const player = createCombatant({
    hero_id: playerHero.id,
    ability_card: equippedCard,
    deck: deck
  }, 'player', 0);
  const goblin = createCombatant({ hero_id: goblinBase.id, deck: goblinAbilities }, 'enemy', 0);

  if (player.abilityData) player.abilityData.isPractice = true;
  goblin.heroData = { ...goblin.heroData, name: `Goblin ${goblinBase.name}` };

  await respond(interaction, {
    content: `${interaction.user.username} begins a practice battle against a Goblin ${goblinBase.name}!`
  });

  const engine = new GameEngine([player, goblin]);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let battleMessage;
  let logText = '';
  const fullLog = [];
  for (const step of engine.runGameSteps()) {
    fullLog.push(...step.log);
    const summaryLog = fullLog.filter(entry => entry.level === 'summary');
    const lines = summaryLog.map(formatLog);
    logText = lines.slice(-MAX_LOG_LINES).join('\n');
    const embed = buildBattleEmbed(step.combatants, logText);
    if (!battleMessage) {
      battleMessage = await interaction.followUp({ embeds: [embed] });
    } else {
      await wait(1000);
      await battleMessage.edit({ embeds: [embed] });
    }
  }

  const summaryEmbed = new EmbedBuilder()
    .setColor(engine.winner === 'player' ? '#57F287' : '#ED4245')
    .setDescription('Practice Complete');

  await interaction.followUp({ embeds: [summaryEmbed] });

  const finalLogString = fullLog
    .map(entry => {
      let prefix = `[R${entry.round}]`;
      let message = entry.message;
      switch (entry.type) {
        case 'round':
          return `\n--- ${message} ---\n`;
        case 'ability-cast':
          message = `✨ ${message}`;
          break;
        case 'defeat':
        case 'victory':
          message = `🏆 ${message} 🏆`;
          break;
        case 'status':
          message = `💀 ${message}`;
          break;
      }
      return `${prefix} ${message}`.trim();
    })
    .join('\n');

  const logBuffer = Buffer.from(finalLogString, 'utf-8');

  try {
    if (typeof interaction.user.send === 'function') {
      await interaction.user.send({
        content: 'Here is the full transcript of your last battle:',
        files: [{ attachment: logBuffer, name: `battle-log-${Date.now()}.txt` }]
      });
    } else {
      throw new Error('DM function unavailable');
    }
  } catch (error) {
    console.error(`Could not send battle log DM to ${interaction.user.tag}.`, error);
    await interaction.followUp({
      content:
        "I couldn't DM you the full battle log. Please check your privacy settings if you'd like to receive them in the future.",
      ephemeral: true
    });
  }
}

module.exports = { data, execute };
