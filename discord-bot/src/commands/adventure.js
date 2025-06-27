const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('node:path');
const userService = require('../utils/userService');

const GameEngine = require(path.join(__dirname, '../../..', 'backend/game/engine'));
const { createCombatant } = require(path.join(__dirname, '../../..', 'backend/game/utils'));
const { allPossibleHeroes, allPossibleAbilities } = require(path.join(__dirname, '../../..', 'backend/game/data'));

const data = new SlashCommandBuilder()
  .setName('adventure')
  .setDescription('Embark on a practice battle in the goblin cave');

function getBaseHeroByClass(cls) {
  return allPossibleHeroes.find(h => h.class === cls && h.isBase);
}

function pickRandomBaseHero() {
  const bases = allPossibleHeroes.filter(h => h.isBase);
  return bases[Math.floor(Math.random() * bases.length)];
}

async function execute(interaction) {
  const user = await userService.getUser(interaction.user.id);

  if (!user || !user.class) {
    await interaction.reply({
      content: 'You must select a class before you can go on an adventure! Use the /game select command to get started.',
      ephemeral: true
    });
    return;
  }

  const playerBase = getBaseHeroByClass(user.class);
  if (!playerBase) {
    await interaction.reply({ content: 'Your selected class data could not be found.', ephemeral: true });
    return;
  }

  const player = createCombatant({ hero_id: playerBase.id, weapon_id: null, armor_id: null, ability_id: null, deck: [] }, 'player', 0);

  const randomBase = pickRandomBaseHero();
  const abilityPool = allPossibleAbilities.filter(a => a.class === randomBase.class && a.rarity === 'Common');
  const goblinDeck = abilityPool.map(a => a.id);
  const goblin = createCombatant({ hero_id: randomBase.id, weapon_id: null, armor_id: null, ability_id: null, deck: goblinDeck }, 'enemy', 0);
  goblin.heroData = { ...goblin.heroData, name: `Goblin ${randomBase.class}` };

  await interaction.reply(`${interaction.user.username} delves into the goblin cave and encounters a ferocious ${goblin.heroData.name}! The battle begins!`);

  const engine = new GameEngine([player, goblin]);
  const log = engine.runFullGame();
  const resultText = engine.winner === 'player' ? 'Victory!' : 'Defeat!';
  log.push(resultText);

  const embed = new EmbedBuilder()
    .setColor(engine.winner === 'player' ? 0x4caf50 : 0xf44336)
    .setTitle('Battle Log')
    .setDescription(log.join('\n'))
    .setTimestamp();

  await interaction.followUp({ embeds: [embed] });
}

module.exports = { data, execute };
