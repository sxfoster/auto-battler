const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const userService = require('../utils/userService');
const abilityCardService = require('../utils/abilityCardService');
const { sendCardDM } = require('../utils/embedBuilder');
const { runBattleLoop, sendBattleLogDM, formatLog } = require('../utils/battleRunner');

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
  .setName('adventure')
  .setDescription('Enter the goblin cave for a practice battle');

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
    deck: deck,
    name: interaction.user.username
  }, 'player', 0);

  const goblin = createCombatant({ hero_id: goblinBase.id, deck: goblinAbilities }, 'enemy', 0);

  goblin.heroData = { ...goblin.heroData, name: `Goblin ${goblinBase.name}` };
  goblin.name = goblin.heroData.name;

  console.log(`[BATTLE START] Player ${playerClass} vs Goblin ${goblinBase.name}`);

  await respond(interaction, {
    content: `${interaction.user.username} delves into the goblin cave and encounters a ferocious Goblin ${goblinBase.name}! The battle begins!`
  });

  const engine = new GameEngine([player, goblin]);
  const { fullLog } = await runBattleLoop(interaction, engine, { waitMs: 250 });

  console.log(
    `[BATTLE END] User: ${interaction.user.username} | Result: ${
      engine.winner === 'player' ? 'Victory' : 'Defeat'
    }`
  );

  if (engine.winner === 'player') {
    await userService.incrementPveWin(user.id);
  } else {
    await userService.incrementPveLoss(user.id);
  }

  let narrativeDescription = '';
  let lootDrop = null;
  const adventurerName = `**${interaction.user.username}**`;
  const enemyName = `a **Goblin ${goblinBase.name}**`;

  if (engine.winner === 'player') {
    let dropText = 'who was slain.';
    if (Math.random() < 0.5) {
      const lootOptions = allPossibleAbilities.filter(
        a => a.class === goblinBase.class && a.rarity === 'Common'
      );
      lootDrop = lootOptions[Math.floor(Math.random() * lootOptions.length)];
      if (lootDrop) {
        dropText = `who was slain and dropped **${lootDrop.name}**.`;
        console.log(
          `[ITEM LOOT] User: ${interaction.user.username} looted Ability: ${lootDrop.name} (ID: ${lootDrop.id})`
        );
        await userService.addAbility(interaction.user.id, lootDrop.id);
      }
    }
    narrativeDescription = `${adventurerName} adventured into the goblin caves and encountered ${enemyName}, ${dropText}`;
  } else {
    narrativeDescription = `${adventurerName} adventured into the goblin caves and encountered ${enemyName} who defeated them.`;
  }

  const summaryEmbed = new EmbedBuilder()
    .setColor(engine.winner === 'player' ? '#57F287' : '#ED4245')
    .setDescription(narrativeDescription);

  await interaction.followUp({ embeds: [summaryEmbed] });

  if (engine.finalPlayerState.equipped_ability_id) {
    await userService.setActiveAbility(
      interaction.user.id,
      engine.finalPlayerState.equipped_ability_id
    );
    console.log(
      `[INVENTORY] User ${interaction.user.username} auto-equipped card ID: ${engine.finalPlayerState.equipped_ability_id}`
    );
  }

  await sendBattleLogDM(interaction, user, fullLog);

  if (lootDrop) {
    if (user.dm_item_drops_enabled) {
      try {
        await sendCardDM(interaction.user, lootDrop);
      } catch (err) {
        console.error('Failed to DM card drop:', err);
        await interaction.followUp({
          content:
            "I couldn't DM you the item drop. Please check your privacy settings if you'd like to receive them in the future.",
          ephemeral: true
        });
      }
    } else {
      console.log(
        `[DM DISABLED] Skipping loot DM for ${interaction.user.username} (dm_item_drops_enabled = false)`
      );
    }
  }
}

module.exports = { data, execute };
