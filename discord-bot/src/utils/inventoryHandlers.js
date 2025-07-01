const { simple } = require('./embedBuilder');
const userService = require('./userService');
const abilityCardService = require('./abilityCardService');
const weaponService = require('./weaponService');
const gameData = require('../../util/gameData');

function getAllAbilities() {
  return Array.from(gameData.gameData.abilities.values());
}

function getAllWeapons() {
  return Array.from(gameData.gameData.weapons.values());
}

function buildBaseEmbed(user, equippedAbility, equippedWeapon, backpack) {
  return simple('Player Inventory', [
    { name: 'Archetype', value: equippedAbility ? `${equippedAbility.class} (${equippedAbility.rarity})` : 'No Archetype Selected' },
    { name: 'Equipped Ability', value: equippedAbility ? equippedAbility.name : 'None', inline: true },
    { name: 'Equipped Weapon', value: equippedWeapon ? equippedWeapon.name : 'None', inline: true },
    { name: 'Backpack', value: backpack }
  ]);
}

async function showAbilities(interaction) {
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.update({ content: 'User not found.', components: [], ephemeral: true });
    return;
  }
  const abilities = getAllAbilities();
  const weapons = getAllWeapons();
  const cards = await abilityCardService.getCards(user.id);
  const weaponRows = await weaponService.getWeapons(user.id);
  const equippedCard = cards.find(c => c.id === user.equipped_ability_id);
  const equippedAbility = equippedCard ? abilities.find(a => a.id === equippedCard.ability_id) : null;
  let equippedWeapon = null;
  if (user.equipped_weapon_id) {
    const wRow = await weaponService.getWeapon(user.equipped_weapon_id);
    if (wRow) equippedWeapon = weapons.find(w => w.id === wRow.weapon_id);
  }
  const list = cards.length ? cards.map(c => {
    const ab = abilities.find(a => a.id === c.ability_id);
    return `${ab ? ab.name : 'Ability'} ${c.charges}/10`;
  }).join('\n') : 'Your backpack is empty.';

  const embed = buildBaseEmbed(user, equippedAbility, equippedWeapon, list);
  await interaction.update({ embeds: [embed], components: interaction.message.components, ephemeral: true });
}

async function showWeapons(interaction) {
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.update({ content: 'User not found.', components: [], ephemeral: true });
    return;
  }
  const abilities = getAllAbilities();
  const weapons = getAllWeapons();
  const cards = await abilityCardService.getCards(user.id);
  const weaponRows = await weaponService.getWeapons(user.id);
  const equippedCard = cards.find(c => c.id === user.equipped_ability_id);
  const equippedAbility = equippedCard ? abilities.find(a => a.id === equippedCard.ability_id) : null;
  let equippedWeapon = null;
  if (user.equipped_weapon_id) {
    const wRow = await weaponService.getWeapon(user.equipped_weapon_id);
    if (wRow) equippedWeapon = weapons.find(w => w.id === wRow.weapon_id);
  }
  const list = weaponRows.length ? weaponRows.map(w => {
    const base = weapons.find(a => a.id === w.weapon_id);
    return base ? base.name : `Weapon ${w.weapon_id}`;
  }).join('\n') : 'Your backpack is empty.';

  const embed = buildBaseEmbed(user, equippedAbility, equippedWeapon, list);
  await interaction.update({ embeds: [embed], components: interaction.message.components, ephemeral: true });
}

module.exports = { showAbilities, showWeapons };
