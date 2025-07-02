const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const userService = require('../src/utils/userService');
const weaponService = require('../src/utils/weaponService');
const abilityCardService = require('../src/utils/abilityCardService');
const { buildBattleEmbed } = require('../src/utils/embedBuilder');
const GameEngine = require('../../backend/game/engine');
const { createCombatant } = require('../../backend/game/utils');
const {
  allPossibleHeroes,
  allPossibleAbilities,
  allPossibleWeapons
} = require('../../backend/game/data');


function formatLog(entry) {
  const prefix = `[R${entry.round}]`;
  let text = entry.message;
  if (entry.type === 'round') text = `**${text}**`;
  else if (entry.type === 'victory' || entry.type === 'defeat') text = `🏆 **${text}** 🏆`;
  else if (entry.type === 'ability-cast') text = `*${text}*`;
  return `${prefix} ${text}`;
}

const data = new SlashCommandBuilder()
  .setName('tutorial')
  .setDescription('Start the guided tutorial');

async function execute(interaction) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
    user = await userService.getUser(interaction.user.id);
  }

  if (user.tutorial_completed) {
    await interaction.reply({ content: 'You have already completed the tutorial.', ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('Choose Your Starting Archetype')
    .setDescription('Select a role that matches your preferred playstyle. This choice will grant you a hero and a powerful ability.');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tutorial_select_tank').setLabel('Stalwart Defender').setEmoji('🛡️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('tutorial_select_dps').setLabel('Raging Fighter').setEmoji('⚔️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('tutorial_select_healer').setLabel('Divine Healer').setEmoji('❤️‍🩹').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('tutorial_select_support').setLabel('Inspiring Artist').setEmoji('🎶').setStyle(ButtonStyle.Primary)
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function runTutorial(interaction, archetype) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
    user = await userService.getUser(interaction.user.id);
  }

  const hero = allPossibleHeroes.find(h => h.class === archetype && h.isBase);
  const ability = allPossibleAbilities.find(a => a.class === archetype && a.rarity === 'Common');
  const rustyKnife = allPossibleWeapons.find(w => w.name === 'Rusty Knife');

  const cardId = await abilityCardService.addCard(user.id, ability.id, 40);
  const weaponId = rustyKnife ? await weaponService.addWeapon(user.id, rustyKnife.id) : null;

  await userService.setActiveAbility(interaction.user.id, cardId);
  if (weaponId) {
    await weaponService.setEquippedWeapon(user.id, weaponId);
  }
  await userService.setUserClass(interaction.user.id, archetype);

  const player = createCombatant({ hero_id: hero.id, ability_card: { id: cardId, ability_id: ability.id, charges: 40 }, weapon_id: rustyKnife ? rustyKnife.id : null, name: interaction.user.username }, 'player', 0);

  const goblin = {
    id: 'enemy-0',
    name: 'Tutorial Goblin',
    heroData: { name: 'Tutorial Goblin', hp: 10, attack: 1, speed: 1, defense: 0 },
    weaponData: rustyKnife,
    armorData: null,
    abilityData: null,
    abilityCharges: 0,
    deck: [],
    team: 'enemy',
    position: 0,
    currentHp: 10,
    maxHp: 10,
    currentEnergy: 0,
    statusEffects: [],
    hp: 10,
    attack: 1 + (rustyKnife ? rustyKnife.statBonuses.ATK || 0 : 0),
    speed: 1,
    defense: 0
  };

  const engine = new GameEngine([player, goblin]);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let logText = '';
  let battleMessage;
  for (const step of engine.runGameSteps()) {
    const lines = step.log.map(formatLog);
    logText = [logText, ...lines].filter(Boolean).join('\n');
    const embed = buildBattleEmbed(step.combatants, logText);
    if (!battleMessage) {
      battleMessage = await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await wait(1000);
      await battleMessage.edit({ embeds: [embed] });
    }
  }

  const lootMessage = rustyKnife ? `The Tutorial Goblin dropped a **${rustyKnife.name}** and **${ability.name}**.` : `The Tutorial Goblin dropped **${ability.name}**.`;

  const summaryEmbed = new EmbedBuilder().setColor('#57F287').setDescription(`Victory! ${lootMessage}`);
  await interaction.followUp({ embeds: [summaryEmbed], ephemeral: true });

  await interaction.followUp({ content: "Congratulations on your victory! Use the /inventory show command to see what's in your backpack.", ephemeral: true });

  setTimeout(() => {
    interaction.followUp({
      content:
        '**Tip:** The bot will sometimes send you DMs with full battle logs or new items you\'ve found. If you find this too noisy, you can turn them off!\n\n' +
        '• Use `/settings battle_logs enabled:False` to disable battle log DMs.\n' +
        '• Use `/settings item_drops enabled:False` to disable new item DMs.',
      ephemeral: true
    });
  }, 10000);

  setTimeout(async () => {
    await interaction.followUp({
      content: 'You can now use /adventure to battle monsters, /challenge @user to duel other players, and /who @user to inspect a character.',
      ephemeral: true
    });
    await userService.markTutorialComplete(interaction.user.id);
  }, 15000);
}

module.exports = { data, execute, runTutorial };
