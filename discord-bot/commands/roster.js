const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');
const { allPossibleHeroes } = require('../../backend/game/data');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roster')
    .setDescription('View your owned champions'),
  async execute(interaction) {
    const userId = interaction.user.id;
    await interaction.deferReply({ ephemeral: true });

    const query = `SELECT uc.hero_id FROM user_champions uc
                   JOIN users u ON uc.user_id = u.id
                   WHERE u.discord_id = ?`;
    const [rows] = await db.execute(query, [userId]);

    if (rows.length === 0) {
      const embed = simple('No Champions Found', [
        { name: 'Info', value: 'You do not own any champions yet.' }
      ]);
      return interaction.editReply({ embeds: [embed] });
    }

    const heroes = rows.map(r => {
      const h = allPossibleHeroes.find(x => x.id === r.hero_id);
      if (!h) return `Unknown (#${r.hero_id})`;
      return `${h.name} - HP ${h.hp}, ATK ${h.attack}, SPD ${h.speed}`;
    });

    const limit = 10;
    const fields = heroes.slice(0, limit).map((text, i) => ({ name: `#${i + 1}`, value: text }));
    if (heroes.length > limit) {
      fields.push({ name: 'More', value: `and ${heroes.length - limit} more...` });
    }

    const embed = simple(`${interaction.user.username}'s Roster`, fields);
    await interaction.editReply({ embeds: [embed] });
  }
};
