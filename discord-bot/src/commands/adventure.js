const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../utils/embedBuilder');
const userService = require('../utils/userService');
const GameEngine = require('../../../backend/game/engine');
const { createCombatant } = require('../../../backend/game/utils');
const { allPossibleHeroes } = require('../../../backend/game/data');

const data = new SlashCommandBuilder()
  .setName('adventure')
  .setDescription('Fight a practice battle against a goblin');

async function execute(interaction) {
  const user = await userService.getUser(interaction.user.id);

  if (!user || !user.class) {
    await interaction.reply({ content: 'You must choose a class before adventuring. Use `/game` to pick one!', ephemeral: true });
    return;
  }

  const playerHero = allPossibleHeroes.find(h => (h.class === user.class || h.name === user.class) && h.isBase);
  const goblinHero = allPossibleHeroes.find(h => h.name === 'Goblin');

  if (!playerHero || !goblinHero) {
    await interaction.reply({ content: 'Required hero data missing.', ephemeral: true });
    return;
  }

  const player = createCombatant({ hero_id: playerHero.id }, 'player', 0);
  const goblin = createCombatant({ hero_id: goblinHero.id }, 'enemy', 0);

  await interaction.reply({ content: `⚔️ ${playerHero.name} engages a Goblin!` });

  const engine = new GameEngine([player, goblin]);
  const log = engine.runFullGame();

  const outcome = engine.winner === 'player' ? 'Victory!' : 'Defeat!';
  const logText = log.concat(outcome).join('\n');
  const embed = simple(outcome, [{ name: 'Battle Log', value: logText }]);

  await interaction.followUp({ embeds: [embed] });
}

module.exports = { data, execute };
