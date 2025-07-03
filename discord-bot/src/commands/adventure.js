const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const userService = require('../utils/userService');
const abilityCardService = require('../utils/abilityCardService');
const weaponService = require('../utils/weaponService');
const { sendCardDM } = require('../utils/embedBuilder');
const { runBattleLoop, sendBattleLogDM, formatLog } = require('../utils/battleRunner');
const replayService = require('../utils/battleReplayService');
const config = require('../../util/config');

const GameEngine = require('../../../backend/game/engine');
const { createCombatant } = require('../../../backend/game/utils');
const gameData = require('../../util/gameData');
const classAbilityMap = require('../data/classAbilityMap');
const { allPossibleWeapons, allPossibleArmors, allPossibleAbilities } = require('../../../backend/game/data');
const feedback = require('../utils/feedback');

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
  const allPossibleHeroes = gameData.getHeroes();
  const allPossibleAbilities = Array.from(gameData.gameData.abilities.values());
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
    user = await userService.getUser(interaction.user.id);
  }

  const playerClass = classAbilityMap[user.class] || user.class || 'Stalwart Defender';
  const playerHero = allPossibleHeroes.find(h => h.class === playerClass && h.isBase);
  if (!playerHero) {
    await feedback.sendError(interaction, 'Data Missing', 'Required hero data missing.');
    return;
  }

  // Pick a random base hero for the goblin opponent
  const baseHeroes = allPossibleHeroes.filter(h => h.isBase);
  const goblinBase = baseHeroes[Math.floor(Math.random() * baseHeroes.length)];

  if (!goblinBase) {
    await feedback.sendError(interaction, 'Data Missing', 'Required goblin data missing.');
    return;
  }

  const cards = await abilityCardService.getCards(user.id);
  const weapons = await weaponService.getWeapons(user.id);
  const equippedCard = cards.find(c => c.id === user.equipped_ability_id);
  const deck = cards.filter(c => c.id !== user.equipped_ability_id);

  // --- START: Dynamic Goblin and XP Logic ---
  const playerLevel = user.level || 1;
  const equipChance = playerLevel * 0.10;
  const upgradeToUncommonChance = 0.10 * playerLevel;
  let xpToAward = 10;

  const goblinEquipment = {};
  const goblinLoot = {
    gold: Math.random() < 0.25 ? 1 : 0,
    ability: null,
    weapon: null
  };

  if (Math.random() < equipChance) {
    const useUncommon = Math.random() < upgradeToUncommonChance;
    const weaponPool = allPossibleWeapons.filter(w => w.rarity === (useUncommon ? 'Uncommon' : 'Common'));
    const weapon = weaponPool[Math.floor(Math.random() * weaponPool.length)];
    goblinEquipment.weapon_id = weapon.id;
    goblinLoot.weapon = weapon;
    xpToAward += 10;
    if (weapon.rarity === 'Uncommon') {
      xpToAward += 50;
    }
  }

  if (Math.random() < equipChance) {
    const useUncommon = Math.random() < upgradeToUncommonChance;
    const armorPool = allPossibleArmors.filter(a => a.rarity === (useUncommon ? 'Uncommon' : 'Common'));
    const armor = armorPool[Math.floor(Math.random() * armorPool.length)];
    goblinEquipment.armor_id = armor.id;
    xpToAward += 10;
    if (armor.rarity === 'Uncommon') {
      xpToAward += 50;
    }
  }

  let uncommonAbilitySelected = false;
  if (Math.random() < equipChance) {
    const useUncommon = Math.random() < upgradeToUncommonChance;
    const abilityPool = allPossibleAbilities.filter(
      a => a.rarity === (useUncommon ? 'Uncommon' : 'Common') && a.class === goblinBase.class
    );
    if (abilityPool.length > 0) {
      const ability = abilityPool[Math.floor(Math.random() * abilityPool.length)];
      goblinEquipment.ability_id = ability.id;
      goblinLoot.ability = ability;
      xpToAward += 10;
      if (ability.rarity === 'Uncommon') {
        xpToAward += 50;
      }
      if (useUncommon && ability.rarity === 'Uncommon') {
        uncommonAbilitySelected = true;
      }
    }
  }
  // --- END: Dynamic Goblin and XP Logic ---

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

  const equippedWeaponRow = user.equipped_weapon_id
    ? await weaponService.getWeapon(user.equipped_weapon_id)
    : null;

  const player = createCombatant({
    hero_id: playerHero.id,
    ability_card: equippedCard,
    deck: deck,
    name: interaction.user.username,
    weapon_id: equippedWeaponRow ? equippedWeaponRow.weapon_id : null,
    level: playerLevel
  }, 'player', 0);

  const goblin = createCombatant({
    hero_id: goblinBase.id,
    deck: [],
    ...goblinEquipment
  }, 'enemy', 0);

  const goblinName = uncommonAbilitySelected
    ? `Veteran Goblin ${goblinBase.name}`
    : `Goblin ${goblinBase.name}`;
  goblin.heroData = { ...goblin.heroData, name: goblinName };
  goblin.name = goblin.heroData.name;

  console.log(`[BATTLE START] Player ${playerClass} vs ${goblin.name}`);

  const startMessage = `${interaction.user.username} delves into the goblin cave and encounters a ferocious ${goblin.name}! The battle begins!`;

  if (typeof interaction.isButton === 'function' && interaction.isButton()) {
    await interaction.channel.send(startMessage);
  } else {
    await respond(interaction, { content: startMessage });
  }

  const engine = new GameEngine([player, goblin]);
  const { fullLog } = await runBattleLoop(interaction, engine, { waitMs: 250 });

  let replayId = null;
  try {
    replayId = await replayService.saveReplay(fullLog);
  } catch (err) {
    console.error('Failed to save replay:', err);
  }

  console.log(
    `[BATTLE END] User: ${interaction.user.username} | Result: ${
      engine.winner === 'player' ? 'Victory' : 'Defeat'
    }`
  );

  let narrativeDescription = '';
  let lootDrop = null;
  const adventurerName = `**${interaction.user.username}**`;
  const enemyName = `a **${goblin.name}**`;

  if (engine.winner === 'player') {
    await userService.incrementPveWin(user.id);

    const xpResult = await userService.addXp(user.id, xpToAward);

    let lootMessages = [];
    if (goblinLoot.gold > 0) {
      await userService.addGold(user.id, goblinLoot.gold);
      lootMessages.push(`found **${goblinLoot.gold} gold**`);
    }

    if (goblinLoot.weapon) {
      await weaponService.addWeapon(user.id, goblinLoot.weapon.id);
      lootMessages.push(`recovered a **${goblinLoot.weapon.name}**`);
      console.log(
        `[ITEM LOOT] User: ${interaction.user.username} looted Weapon: ${goblinLoot.weapon.name} (ID: ${goblinLoot.weapon.id})`
      );
    }

    if (goblinLoot.ability) {
      await userService.addAbility(interaction.user.id, goblinLoot.ability.id);
      lootMessages.push(`recovered the **${goblinLoot.ability.name}** card`);
      lootDrop = goblinLoot.ability;
      console.log(
        `[ITEM LOOT] User: ${interaction.user.username} looted Ability: ${goblinLoot.ability.name} (ID: ${goblinLoot.ability.id})`
      );
    }

    lootMessages.push(`earned **${xpToAward} XP**`);

    let lootString = 'and was victorious!';
    if (lootMessages.length > 0) {
      lootString = 'and ' + lootMessages.join(', ') + '!';
    }

    narrativeDescription = `${interaction.user.username} defeated the goblin ${lootString}`;
    if (xpResult.leveledUp) {
      await interaction.followUp({
        content: `🎉 **Congratulations, ${interaction.user.username}! You have reached Level ${xpResult.newLevel}!** 🎉`
      });
    }
  } else {
    await userService.incrementPveLoss(user.id);
    narrativeDescription = `${adventurerName} adventured into the goblin caves and encountered ${enemyName} who defeated them.`;
  }

  const summaryEmbed = new EmbedBuilder()
    .setColor(engine.winner === 'player' ? '#57F287' : '#ED4245')
    .setDescription(narrativeDescription);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('back-to-town')
      .setLabel('Back to Town')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`continue-adventure:${interaction.user.id}`)
      .setLabel('Continue Adventuring')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel('View Battle Replay')
      .setURL(`${config.WEB_APP_URL}/replay/${replayId ?? ''}`)
  );

  await interaction.followUp({ embeds: [summaryEmbed], components: [row] });

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
        await feedback.sendInfo(
          interaction,
          'DM Failed',
          "I couldn't DM you the item drop. Please check your privacy settings if you'd like to receive them in the future."
        );
      }
    } else {
      console.log(
        `[DM DISABLED] Skipping loot DM for ${interaction.user.username} (dm_item_drops_enabled = false)`
      );
    }
  }
}

module.exports = { data, execute };
