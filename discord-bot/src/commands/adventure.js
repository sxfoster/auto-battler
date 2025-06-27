const { SlashCommandBuilder } = require('discord.js');
const userService = require('../utils/userService');
const { sendCardDM, buildCardEmbed } = require('../utils/embedBuilder');
const GameEngine = require('../../../backend/game/engine');
const { createCombatant } = require('../../../backend/game/utils');
const { allPossibleHeroes, allPossibleAbilities } = require('../../../backend/game/data');
const classes = require('../data/classes');

const classAbilityMap = {
  Warrior: 'Stalwart Defender',
  Bard: 'Inspiring Artist',
  Barbarian: 'Raging Fighter',
  Cleric: 'Divine Healer',
  Druid: 'Nature Shaper',
  Enchanter: 'Mystic Deceiver',
  Paladin: 'Holy Warrior',
  Rogue: 'Shadow Striker',
  Ranger: 'Wilderness Expert',
  Sorcerer: 'Raw Power Mage',
  Wizard: 'Arcane Savant'
};

const data = new SlashCommandBuilder()
  .setName('adventure')
  .setDescription('Enter the goblin cave for a practice battle');

async function execute(interaction) {
  const user = await userService.getUser(interaction.user.id);

  if (!user || !user.class) {
    await interaction.reply({ content: 'You must select a class before you can go on an adventure! Use the /game command to get started.', ephemeral: true });
    return;
  }

  const playerHero = allPossibleHeroes.find(h => (h.class === user.class || h.name === user.class) && h.isBase);
  if (!playerHero) {
    await interaction.reply({ content: 'Required hero data missing.', ephemeral: true });
    return;
  }

  // Pick a random class for the goblin opponent
  const classNames = classes.map(c => c.name);
  const goblinClass = classNames[Math.floor(Math.random() * classNames.length)];
  const goblinBase = allPossibleHeroes.find(h => (h.class === goblinClass || h.name === goblinClass) && h.isBase);

  if (!goblinBase) {
    await interaction.reply({ content: 'Required goblin data missing.', ephemeral: true });
    return;
  }

  const playerAbilities = allPossibleAbilities
    .filter(a => a.class === (classAbilityMap[user.class] || user.class) && a.rarity === 'Common')
    .map(a => a.id);

  const goblinAbilityPool = allPossibleAbilities
    .filter(a => a.class === (classAbilityMap[goblinClass] || goblinClass) && a.rarity === 'Common');
  const goblinAbilities = goblinAbilityPool.map(a => a.id);

  const player = createCombatant({ hero_id: playerHero.id, deck: playerAbilities }, 'player', 0);
  const goblin = createCombatant({ hero_id: goblinBase.id, deck: goblinAbilities }, 'enemy', 0);
  goblin.heroData = { ...goblin.heroData, name: `Goblin ${goblinClass}` };

  await interaction.reply({ content: `${interaction.user.username} delves into the goblin cave and encounters a ferocious Goblin ${goblinClass}! The battle begins!` });

  const engine = new GameEngine([player, goblin]);
  const log = engine.runFullGame();

  const outcome = engine.winner === 'player' ? 'Victory!' : 'Defeat!';
  const logText = log.concat(outcome).join('\n');
  const embed = new (require('discord.js').EmbedBuilder)()
    .setColor('#29b6f6')
    .setTitle(outcome)
    .setDescription(logText)
    .setTimestamp()
    .setFooter({ text: 'Auto\u2011Battler Bot' });

  await interaction.followUp({ embeds: [embed] });

  if (engine.winner === 'player') {
    const drop = goblinAbilityPool[Math.floor(Math.random() * goblinAbilityPool.length)];
    if (drop) {
      await userService.addAbility(interaction.user.id, drop.id);
      if (interaction.user.send) {
        try {
          await sendCardDM(interaction.user, drop);
        } catch (err) {
          console.error('Failed to DM card drop:', err);
          await interaction.followUp({ embeds: [buildCardEmbed(drop)], ephemeral: true });
        }
      } else {
        await interaction.followUp({ embeds: [buildCardEmbed(drop)], ephemeral: true });
      }
    }
  }
}

module.exports = { data, execute };
