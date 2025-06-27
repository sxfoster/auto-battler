const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userService = require('../utils/userService');
const { allPossibleHeroes } = require('../../../backend/game/data');
const { createCombatant } = require('../../../backend/game/utils');
const GameEngine = require('../../../backend/game/engine');

// Map player classes to hero groups in data.js
const CLASS_MAP = {
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
  Wizard: 'Arcane Savant',
};

const data = new SlashCommandBuilder()
  .setName('adventure')
  .setDescription('Test your skills against a goblin.');

async function execute(interaction) {
  const user = await userService.getUser(interaction.user.id);
  if (!user || !user.class) {
    await interaction.reply({ content: 'Choose a class with /game before going on an adventure.', ephemeral: true });
    return;
  }

  const heroClass = CLASS_MAP[user.class];
  const heroTemplate = allPossibleHeroes.find(h => h.class === heroClass);
  if (!heroTemplate) {
    await interaction.reply({ content: 'Your class data is missing.', ephemeral: true });
    return;
  }

  const playerCombatant = createCombatant({ hero_id: heroTemplate.id }, 'player', 0);
  const goblinTemplate = allPossibleHeroes.find(h => h.class === 'Brute');
  const goblinCombatant = createCombatant({ hero_id: goblinTemplate.id }, 'enemy', 0);
  goblinCombatant.heroData.name = 'Goblin';

  const engine = new GameEngine([playerCombatant, goblinCombatant]);
  const log = engine.runFullGame();
  const result = engine.winner === 'player' ? 'Victory!' : 'Defeat!';

  await interaction.channel.send({ content: `**${interaction.user.username}** engages a Goblin in battle!` });

  const embed = new EmbedBuilder()
    .setTitle(`Battle Log - ${result}`)
    .setDescription(log.join('\n'));
  await interaction.channel.send({ embeds: [embed] });
}

module.exports = { data, execute };
