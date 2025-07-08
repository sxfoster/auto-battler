const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Show equipped items and backpack contents'),
  async execute(interaction) {
    const discordId = interaction.user.id;

    const { rows: players } = await db.query(
      'SELECT id, equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE discord_id = ?',
      [discordId]
    );
    if (players.length === 0) {
      const embed = simple('No character found.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const player = players[0];
    const playerId = player.id;

    const { rows: weapons } = await db.query(
      'SELECT id, name FROM user_weapons WHERE player_id = ?',
      [playerId]
    );
    const { rows: armors } = await db.query(
      'SELECT id, name FROM user_armors WHERE player_id = ?',
      [playerId]
    );
    const { rows: abilities } = await db.query(
      'SELECT id, name FROM user_ability_cards WHERE player_id = ?',
      [playerId]
    );

    const equippedWeapon = weapons.find(w => w.id === player.equipped_weapon_id);
    const equippedArmor = armors.find(a => a.id === player.equipped_armor_id);
    const equippedAbility = abilities.find(a => a.id === player.equipped_ability_id);

    const fields = [
      { name: 'Weapon', value: equippedWeapon ? equippedWeapon.name : 'None', inline: true },
      { name: 'Armor', value: equippedArmor ? equippedArmor.name : 'None', inline: true },
      { name: 'Ability', value: equippedAbility ? equippedAbility.name : 'None', inline: true },
    ];

    const backpack = [...weapons, ...armors, ...abilities]
      .filter(i => ![
        player.equipped_weapon_id,
        player.equipped_armor_id,
        player.equipped_ability_id
      ].includes(i.id))
      .map(i => i.name)
      .join(', ');
    if (backpack) {
      fields.push({ name: 'Backpack', value: backpack });
    }

    const embed = simple('Inventory', fields);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
