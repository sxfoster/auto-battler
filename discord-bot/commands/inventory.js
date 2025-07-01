const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');
const weaponService = require('../src/utils/weaponService');
const { createBackToTownRow } = require('../src/utils/navigation');
const gameData = require('../util/gameData');

function getAllAbilities() {
  return Array.from(gameData.gameData.abilities.values());
}

function getAllWeapons() {
  return Array.from(gameData.gameData.weapons.values());
}

const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription('Manage your backpack')
  .addSubcommand(sub =>
    sub
      .setName('show')
      .setDescription('Display your current status and backpack')
  )
  .addSubcommand(sub =>
    sub
      .setName('set')
      .setDescription('Equip an ability card')
      .addStringOption(opt =>
        opt
          .setName('ability')
          .setDescription('Name of the ability to equip')
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  // temporary alias for backwards compatibility
  .addSubcommand(sub =>
    sub
      .setName('equip')
      .setDescription('Equip an ability card')
      .addStringOption(opt =>
        opt
          .setName('ability')
          .setDescription('Name of the ability to equip')
          .setRequired(true)
          .setAutocomplete(true)
      )
  );

async function execute(interaction) {
  const allPossibleAbilities = getAllAbilities();
  const sub = interaction.options.getSubcommand(false) || 'show';
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
    user = await userService.getUser(interaction.user.id);
  }

  if (sub === 'show') {
    const cards = await abilityCardService.getCards(user.id);
    const weapons = await weaponService.getWeapons(user.id);

    const abilityList = cards.length
      ? cards
          .map(c => {
            const ability = allPossibleAbilities.find(a => a.id === c.ability_id);
            const name = ability ? ability.name : `Ability ${c.ability_id}`;
            return `${name} ${c.charges}/10`;
          })
          .join('\n')
      : 'Your backpack is empty.';

    const weaponList = weapons.length
      ? weapons
          .map(w => {
            const weapon = getAllWeapons().find(a => a.id === w.weapon_id);
            return weapon ? weapon.name : `Weapon ${w.weapon_id}`;
          })
          .join('\n')
      : 'Your backpack is empty.';

    const equippedCard = cards.find(c => c.id === user.equipped_ability_id);
    const equippedAbility = equippedCard
      ? allPossibleAbilities.find(a => a.id === equippedCard.ability_id)
      : null;
    const equippedName = equippedAbility ? equippedAbility.name : 'None';
    const archetype = equippedAbility
      ? `${equippedAbility.class} (${equippedAbility.rarity})`
      : 'No Archetype Selected';

    let equippedWeapon = null;
    if (user.equipped_weapon_id) {
      const wRow = await weaponService.getWeapon(user.equipped_weapon_id);
      if (wRow) {
        equippedWeapon = getAllWeapons().find(w => w.id === wRow.weapon_id);
      }
    }

    const embed = simple(
      'Player Inventory',
      [
        { name: 'Archetype', value: archetype },
        { name: 'Equipped Ability', value: equippedName, inline: true },
        { name: 'Equipped Weapon', value: equippedWeapon ? equippedWeapon.name : 'None', inline: true },
        { name: 'Backpack', value: 'Select a category to view items.' }
      ],
      interaction.user.displayAvatarURL()
    );

    const filterRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('inv-view-abilities')
        .setLabel('Abilities')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('inv-view-weapons')
        .setLabel('Weapons')
        .setStyle(ButtonStyle.Secondary)
    );

    const actionRow = new ActionRowBuilder();
    const abilityCounts = cards.reduce((acc, card) => {
      acc[card.ability_id] = (acc[card.ability_id] || 0) + 1;
      return acc;
    }, {});
    const hasDuplicates = Object.values(abilityCounts).some(count => count > 1);

    if (hasDuplicates) {
      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId('inventory-merge-start')
          .setLabel('Merge Duplicates')
          .setStyle(ButtonStyle.Primary)
      );
    }

    if (cards.length > 0 || weapons.length > 0) {
      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId('inventory-equip-start')
          .setLabel('Equip Item')
          .setStyle(ButtonStyle.Success)
      );
    }

    const replyOptions = { embeds: [embed], ephemeral: true, components: [filterRow] };
    if (actionRow.components.length > 0) {
      replyOptions.components.push(actionRow);
    }
    replyOptions.components.push(createBackToTownRow());

    await interaction.reply(replyOptions);
    return;
  }


  if (sub === 'set' || sub === 'equip') {
    const abilityName = interaction.options.getString('ability');
    const ability = allPossibleAbilities.find(a => a.name.toLowerCase() === abilityName.toLowerCase());
    if (!ability) {
      await interaction.reply({ content: 'Ability not found.', ephemeral: true });
      return;
    }

    const cards = (await abilityCardService.getCards(user.id)).filter(
      c => c.ability_id === ability.id && c.charges > 0
    );
    if (!cards.length) {
      await interaction.reply({ content: `You don't own any charged copies of ${ability.name}.`, ephemeral: true });
      return;
    }

    if (cards.length === 1) {
      await abilityCardService.setEquippedCard(user.id, cards[0].id);
      const msg = `You have equipped ${ability.name}. Your active archetype is now ${ability.class} (${ability.rarity}).`;
      await interaction.reply({ content: msg, ephemeral: true });
      return;
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('equip-card')
      .setPlaceholder('Select a card')
      .addOptions(
        cards.map(card => ({
          label: `${ability.name} (${card.charges}/10)`,
          value: String(card.id)
        }))
      );
    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ content: 'Choose a card to equip:', components: [row], ephemeral: true });
  }
}

async function handleSetAbilityButton(interaction) {
  const allPossibleAbilities = getAllAbilities();
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.reply({ content: 'User not found.', ephemeral: true });
    return;
  }

  const cards = (await abilityCardService.getCards(user.id)).filter(c => c.charges > 0);
  const uniqueIds = [...new Set(cards.map(c => c.ability_id))];
  if (!uniqueIds.length) {
    await interaction.reply({ content: 'You have no usable ability cards.', ephemeral: true });
    return;
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('ability-select')
    .setPlaceholder('Select an ability')
    .addOptions(
      uniqueIds.map(id => {
        const ability = allPossibleAbilities.find(a => a.id === id);
        const name = ability ? ability.name : `Ability ${id}`;
        return { label: name, value: String(id) };
      })
    );
  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.reply({ content: 'Choose an ability to equip:', components: [row], ephemeral: true });
}

async function handleAbilitySelect(interaction) {
  const allPossibleAbilities = getAllAbilities();
  const abilityId = parseInt(interaction.values[0], 10);
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.update({ content: 'User not found.', components: [], ephemeral: true });
    return;
  }

  const ability = allPossibleAbilities.find(a => a.id === abilityId);
  const abilityName = ability?.name || `Ability ${abilityId}`;
  if (!ability) {
    await interaction.update({ content: 'Ability not found.', components: [], embeds: [], ephemeral: true });
    return;
  }

  const cards = (await abilityCardService.getCards(user.id)).filter(c => c.ability_id === abilityId && c.charges > 0);

  if (cards.length === 1) {
    await abilityCardService.setEquippedCard(user.id, cards[0].id);
    const msg = `You have equipped ${abilityName}. Your active archetype is now ${ability.class} (${ability.rarity}).`;
    await interaction.update({ content: msg, components: [], embeds: [], ephemeral: true });
    return;
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('equip-card')
    .setPlaceholder('Select a card')
    .addOptions(
      cards.map(card => ({
        label: `${abilityName} (${card.charges}/10)`,
        value: String(card.id)
      }))
    );
  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.update({ content: 'Choose a card to equip:', components: [row], ephemeral: true });
}

async function handleEquipSelect(interaction) {
  const allPossibleAbilities = getAllAbilities();
  const cardId = parseInt(interaction.values[0], 10);
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.update({ content: 'User not found.', components: [], ephemeral: true });
    return;
  }

  const cards = await abilityCardService.getCards(user.id);
  const card = cards.find(c => c.id === cardId);
  const ability = card ? allPossibleAbilities.find(a => a.id === card.ability_id) : null;
  const abilityName = ability?.name || 'Ability';
  if (!ability) {
    await interaction.update({ content: 'Ability not found.', components: [], embeds: [], ephemeral: true });
    return;
  }

  await abilityCardService.setEquippedCard(user.id, cardId);

  const msg = `You have equipped ${abilityName}. Your active archetype is now ${ability.class} (${ability.rarity}).`;
  await interaction.update({ content: msg, components: [], embeds: [], ephemeral: true });
}

async function handleSetWeaponButton(interaction) {
  const allWeapons = getAllWeapons();
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.reply({ content: 'User not found.', ephemeral: true });
    return;
  }

  const weapons = await weaponService.getWeapons(user.id);
  if (!weapons.length) {
    await interaction.reply({ content: 'You have no weapons.', ephemeral: true });
    return;
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('weapon-select')
    .setPlaceholder('Select a weapon')
    .addOptions(
      weapons.map(w => {
        const base = allWeapons.find(a => a.id === w.weapon_id);
        const name = base ? base.name : `Weapon ${w.weapon_id}`;
        return { label: name, value: String(w.id) };
      })
    );
  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.reply({ content: 'Choose a weapon to equip:', components: [row], ephemeral: true });
}

async function handleWeaponSelect(interaction) {
  const allWeapons = getAllWeapons();
  const weaponInstId = parseInt(interaction.values[0], 10);
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.update({ content: 'User not found.', components: [], ephemeral: true });
    return;
  }

  const weapon = await weaponService.getWeapon(weaponInstId);
  if (!weapon || weapon.user_id !== user.id) {
    await interaction.update({ content: 'Weapon not found.', components: [], ephemeral: true });
    return;
  }

  await weaponService.setEquippedWeapon(user.id, weaponInstId);

  const base = allWeapons.find(a => a.id === weapon.weapon_id);
  const name = base ? base.name : 'Weapon';
  await interaction.update({ content: `You have equipped ${name}.`, components: [], embeds: [], ephemeral: true });
}

async function handleEquipButton(interaction) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('set-ability')
      .setLabel('Ability')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('set-weapon')
      .setLabel('Weapon')
      .setStyle(ButtonStyle.Primary)
  );
  await interaction.reply({ content: 'What type of item would you like to equip?', components: [row], ephemeral: true });
}

async function handleMergeButton(interaction) {
  const allPossibleAbilities = getAllAbilities();
  const user = await userService.getUser(interaction.user.id);
  const cards = await abilityCardService.getCards(user.id);

  const abilityCounts = cards.reduce((acc, card) => {
    acc[card.ability_id] = (acc[card.ability_id] || 0) + 1;
    return acc;
  }, {});

  const mergeableAbilityIds = Object.keys(abilityCounts).filter(id => abilityCounts[id] > 1);

  if (mergeableAbilityIds.length === 0) {
    return interaction.reply({ content: 'You have no abilities with duplicate cards to merge.', ephemeral: true });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('merge-ability-select')
    .setPlaceholder('Select an ability to merge')
    .addOptions(
      mergeableAbilityIds.map(id => {
        const ability = allPossibleAbilities.find(a => a.id === parseInt(id));
        return {
          label: `${ability.name} (${abilityCounts[id]} copies)`,
          value: String(id)
        };
      })
    );

  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.reply({ content: 'Which ability would you like to merge all copies of?', components: [row], ephemeral: true });
}

async function handleMergeSelect(interaction) {
  const allPossibleAbilities = getAllAbilities();
  const abilityId = parseInt(interaction.values[0], 10);
  const user = await userService.getUser(interaction.user.id);
  const allCards = await abilityCardService.getCards(user.id);
  const cardsToMerge = allCards.filter(c => c.ability_id === abilityId);

  if (cardsToMerge.length <= 1) {
    return interaction.update({ content: 'Not enough copies to merge.', components: [], ephemeral: true });
  }

  const totalCharges = cardsToMerge.reduce((sum, card) => sum + card.charges, 0);
  const cardIdsToDelete = cardsToMerge.map(card => card.id);

  await abilityCardService.deleteCards(cardIdsToDelete);
  await abilityCardService.addCard(user.id, abilityId, totalCharges);

  const ability = allPossibleAbilities.find(a => a.id === abilityId);
  const abilityName = ability ? ability.name : `Ability ${abilityId}`;

  await interaction.update({
    content: `✅ All ${cardsToMerge.length} copies of **${abilityName}** have been merged into a single card with **${totalCharges}** charges.`,
    components: [],
    ephemeral: true
  });
}

async function autocomplete(interaction) {
  const allPossibleAbilities = getAllAbilities();
  const sub = interaction.options.getSubcommand();
  const focused = interaction.options.getFocused();
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.respond([]);
    return;
  }
  const cards = await abilityCardService.getCards(user.id);
  const abilityIds = [...new Set(cards.filter(c => c.charges > 0).map(c => c.ability_id))];
  const abilities = abilityIds
    .map(id => allPossibleAbilities.find(a => a.id === id))
    .filter(Boolean);
  const filtered = abilities
    .filter(a => a.name.toLowerCase().includes(focused.toLowerCase()))
    .slice(0, 25)
    .map(a => ({ name: a.name, value: a.name }));
  await interaction.respond(filtered);
}

module.exports = {
  data,
  execute,
  handleEquipButton,
  handleMergeButton,
  handleMergeSelect,
  handleEquipSelect,
  handleSetAbilityButton,
  handleSetWeaponButton,
  handleWeaponSelect,
  handleAbilitySelect,
  autocomplete
};
