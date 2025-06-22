const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const { allPossibleHeroes, allPossibleAbilities, allPossibleWeapons } = require('../../backend/game/data');

async function sendHeroSelection(interaction, session) {
    const shuffledHeroes = [...allPossibleHeroes].sort(() => 0.5 - Math.random());
    const heroChoices = shuffledHeroes.slice(0, 4);

    const embed = simple('Hero Selection', [{ name: 'Instructions', value: 'Choose the first hero for your team.' }]);
    const buttons = heroChoices.map(hero =>
        new ButtonBuilder()
            .setCustomId(`${session.id}:pickHero:${hero.id}`)
            .setLabel(hero.name)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('👤')
    );
    const actionRow = new ActionRowBuilder().addComponents(buttons);

    await interaction.editReply({ content: 'Choose your hero.', embeds: [embed], components: [actionRow] });
}

async function sendAbilitySelection(interaction, session, chosenHeroId) {
    const hero = allPossibleHeroes.find(h => h.id === chosenHeroId);
    const abilityPool = allPossibleAbilities.filter(a => a.class === hero.class);
    const abilityChoices = [...abilityPool].sort(() => 0.5 - Math.random()).slice(0, 4);

    const embed = simple('Ability Selection', [{ name: 'Instructions', value: `Choose an ability for your ${hero.name}.` }]);
    const buttons = abilityChoices.map(ability =>
        new ButtonBuilder()
            .setCustomId(`${session.id}:pickAbility:${ability.id}`)
            .setLabel(ability.name)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('✨')
    );
    const actionRow = new ActionRowBuilder().addComponents(buttons);

    await interaction.editReply({ content: 'Next up, choose an ability.', embeds: [embed], components: [actionRow] });
}

async function sendWeaponSelection(interaction, session, chosenHeroName) {
    const weaponChoices = [...allPossibleWeapons].sort(() => 0.5 - Math.random()).slice(0, 4);

    const embed = simple('Weapon Selection', [{ name: 'Instructions', value: `Choose a weapon for your ${chosenHeroName}.` }]);
    const buttons = weaponChoices.map(weapon =>
        new ButtonBuilder()
            .setCustomId(`${session.id}:pickWeapon:${weapon.id}`)
            .setLabel(weapon.name)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⚔️')
    );
    const actionRow = new ActionRowBuilder().addComponents(buttons);

    await interaction.editReply({ content: 'Finally, choose a weapon.', embeds: [embed], components: [actionRow] });
}

module.exports = { sendHeroSelection, sendAbilitySelection, sendWeaponSelection };
