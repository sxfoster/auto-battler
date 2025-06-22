const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { allPossibleHeroes, allPossibleAbilities, allPossibleWeapons } = require('../../backend/game/data');

async function sendHeroSelection(interaction, gameId) {
    const shuffledHeroes = [...allPossibleHeroes].sort(() => 0.5 - Math.random());
    const heroChoices = shuffledHeroes.slice(0, 4);

    const embed = new EmbedBuilder().setColor('#0099ff').setTitle('Hero Selection').setDescription('Choose the first hero for your team.');
    const buttons = heroChoices.map(hero =>
        new ButtonBuilder()
            .setCustomId(`draft_hero_${gameId}_${hero.id}`)
            .setLabel(hero.name)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('👤')
    );
    const actionRow = new ActionRowBuilder().addComponents(buttons);

    await interaction.user.send({ content: `Game #${gameId}: It's time to draft!`, embeds: [embed], components: [actionRow] });
}

async function sendAbilitySelection(interaction, gameId, chosenHeroId) {
    const hero = allPossibleHeroes.find(h => h.id === chosenHeroId);
    const abilityPool = allPossibleAbilities.filter(a => a.class === hero.class);
    const abilityChoices = [...abilityPool].sort(() => 0.5 - Math.random()).slice(0, 4);

    const embed = new EmbedBuilder().setColor('#22c55e').setTitle('Ability Selection').setDescription(`Choose an ability for your ${hero.name}.`);
    const buttons = abilityChoices.map(ability =>
        new ButtonBuilder()
            .setCustomId(`draft_ability_${gameId}_${ability.id}`)
            .setLabel(ability.name)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('✨')
    );
    const actionRow = new ActionRowBuilder().addComponents(buttons);

    await interaction.editReply({ content: 'Next up, choose an ability.', embeds: [embed], components: [actionRow] });
}

async function sendWeaponSelection(interaction, gameId, chosenHeroName) {
    const weaponChoices = [...allPossibleWeapons].sort(() => 0.5 - Math.random()).slice(0, 4);

    const embed = new EmbedBuilder().setColor('#ef4444').setTitle('Weapon Selection').setDescription(`Choose a weapon for your ${chosenHeroName}.`);
    const buttons = weaponChoices.map(weapon =>
        new ButtonBuilder()
            .setCustomId(`draft_weapon_${gameId}_${weapon.id}`)
            .setLabel(weapon.name)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⚔️')
    );
    const actionRow = new ActionRowBuilder().addComponents(buttons);

    await interaction.editReply({ content: 'Finally, choose a weapon.', embeds: [embed], components: [actionRow] });
}

module.exports = { sendHeroSelection, sendAbilitySelection, sendWeaponSelection };
