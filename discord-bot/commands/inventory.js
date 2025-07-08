const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your equipped items and backpack'),
  async execute(interaction) {
    const discordId = interaction.user.id;
    const { rows: playerRows } = await db.query(
      'SELECT id, equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE discord_id = ?',
      [discordId]
    );
    if (playerRows.length === 0) {
      const embed = simple('You have no character.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }
    const player = playerRows[0];
    const playerId = player.id;
    const [weaponRes, armorRes, abilityRes] = await Promise.all([
      db.query('SELECT id, name FROM user_weapons WHERE player_id = ?', [playerId]),
      db.query('SELECT id, name FROM user_armors WHERE player_id = ?', [playerId]),
      db.query('SELECT id, name FROM user_ability_cards WHERE player_id = ?', [playerId])
    ]);
    const weapons = weaponRes.rows;
    const armors = armorRes.rows;
    const abilities = abilityRes.rows;
    const equippedWeapon = weapons.find(w => w.id === player.equipped_weapon_id);
    const equippedArmor = armors.find(a => a.id === player.equipped_armor_id);
    const equippedAbility = abilities.find(a => a.id === player.equipped_ability_id);
    const embed = simple('Inventory', [
      { name: 'Equipped Weapon', value: equippedWeapon ? equippedWeapon.name : 'None', inline: true },
      { name: 'Equipped Armor', value: equippedArmor ? equippedArmor.name : 'None', inline: true },
      { name: 'Equipped Ability', value: equippedAbility ? equippedAbility.name : 'None', inline: true },
      { name: 'Weapons', value: weapons.map(w => w.name).join(', ') || 'None' },
      { name: 'Armors', value: armors.map(a => a.name).join(', ') || 'None' },
      { name: 'Ability Cards', value: abilities.map(a => a.name).join(', ') || 'None' }
    ]);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
