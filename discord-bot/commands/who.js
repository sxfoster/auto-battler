const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');
const {
  allPossibleHeroes,
  allPossibleAbilities
} = require('../../backend/game/data');

const data = new SlashCommandBuilder()
  .setName('who')
  .setDescription('Look up a player by mention')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('Discord user to look up')
      .setRequired(true)
  );

async function execute(interaction) {
  const mentionedUser = interaction.options.getUser('user');
  const user = await userService.getUser(mentionedUser.id);

  if (!user) {
    const embed = simple('Player Details', [{
      name: 'Player',
      value: `@${mentionedUser.username} has not started their adventure yet.`
    }], mentionedUser.displayAvatarURL());
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }


  const baseHero = allPossibleHeroes.find(
    h => (h.class === user.class || h.name === user.class) && h.isBase
  );
  const hp = baseHero ? baseHero.hp : '??';
  const atk = baseHero ? baseHero.attack : '??';

  let abilityName = 'None';
  let archetype = 'None';
  if (user.equipped_ability_id) {
    const card = await abilityCardService.getCard(user.equipped_ability_id);
    if (card) {
      const ability = allPossibleAbilities.find(a => a.id === card.ability_id);
      if (ability) {
        abilityName = ability.name;
        archetype = `${ability.class} (${ability.rarity})`;
      } else {
        abilityName = `Ability ${card.ability_id}`;
      }
    }
  }

  let className = user.class || 'None';
  if (user.pvp_status_until && new Date(user.pvp_status_until) > new Date()) {
    className = 'Hidden (In a Challenge)';
  }

  const embed = simple(
    'Character Sheet',
    [
      { name: 'Player', value: `${user.name}` },
      { name: 'Class', value: className },
      { name: 'HP', value: String(hp), inline: true },
      { name: 'Attack', value: String(atk), inline: true },
      { name: 'Equipped Ability', value: abilityName }
    ],
    mentionedUser.displayAvatarURL()
  );
  await interaction.reply({ embeds: [embed] });
}

module.exports = { data, execute };
