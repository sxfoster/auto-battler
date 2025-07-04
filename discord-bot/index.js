const { Client, GatewayIntentBits, Partials, Collection, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

const token = process.env.DISCORD_TOKEN || 'YOUR_BOT_TOKEN';

// Database connection pool for persistent user data
const db = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'autobattler'
});

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel]
});

client.commands = new Collection();

function simple(title, fields) {
    return new EmbedBuilder().setColor('#29b6f6').setTitle(title).addFields(fields);
}

function confirm(text) {
    return new EmbedBuilder().setColor('#66bb6a').setDescription(text);
}

// Sample card pools
const allPossibleHeroes = [
    { id: 1, name: 'Recruit', rarity: 'Common', is_monster: false },
    { id: 2, name: 'Soldier', rarity: 'Uncommon', is_monster: false },
    { id: 3, name: 'Vanguard', rarity: 'Rare', is_monster: false },
    { id: 4, name: 'Warbringer', rarity: 'Epic', is_monster: false }
];

const allPossibleAbilities = [
    { id: 101, name: 'Slash', rarity: 'Common' },
    { id: 102, name: 'Strike', rarity: 'Uncommon' },
    { id: 103, name: 'Blast', rarity: 'Rare' }
];

const allPossibleWeapons = [
    { id: 201, name: 'Short Sword', rarity: 'Common' },
    { id: 202, name: 'Long Sword', rarity: 'Uncommon' },
    { id: 203, name: 'War Axe', rarity: 'Rare' }
];

const allPossibleArmors = [
    { id: 301, name: 'Leather Armor', rarity: 'Common' },
    { id: 302, name: 'Chainmail', rarity: 'Uncommon' },
    { id: 303, name: 'Platemail', rarity: 'Rare' }
];

function getRandomCardsForPack(pool, count, rarity) {
    const rarities = ['common', 'uncommon', 'rare', 'epic'];
    const index = rarities.indexOf(rarity.toLowerCase());
    const allowed = pool.filter(c => rarities.indexOf(c.rarity.toLowerCase()) >= index);
    const result = [];
    for (let i = 0; i < count && allowed.length; i++) {
        const idx = Math.floor(Math.random() * allowed.length);
        result.push(allowed.splice(idx, 1)[0]);
    }
    return result;
}

const BOOSTER_PACKS = {
    'basic_hero_pack': { name: 'Basic Hero Pack', cost: 100, currency: 'soft_currency', type: 'hero_pack', rarity: 'basic' },
    'standard_ability_pack': { name: 'Standard Ability Pack', cost: 75, currency: 'soft_currency', type: 'ability_pack', rarity: 'standard' },
    'premium_weapon_pack': { name: 'Premium Weapon Pack', cost: 150, currency: 'soft_currency', type: 'weapon_pack', rarity: 'premium' },
    'basic_armor_pack': { name: 'Basic Armor Pack', cost: 80, currency: 'soft_currency', type: 'armor_pack', rarity: 'basic' }
};

// Load commands
const townCommand = require('./commands/town');
const adventureCommand = require('./commands/adventure');
client.commands.set(townCommand.data.name, townCommand);
client.commands.set(adventureCommand.data.name, adventureCommand);

client.once(Events.ClientReady, () => {
    console.log('Bot ready');
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) {
            await command.execute(interaction);
        }
        return;
    }

    if (!interaction.isButton()) return;

    // Navigation buttons for returning to town
    if (interaction.customId === 'nav-town-new') {
        const townCommand = client.commands.get('town');
        if (townCommand) {
            await townCommand.execute(interaction);
        }
        return;
    }

    if (interaction.customId === 'nav-town') {
        const townEmbed = new EmbedBuilder()
            .setTitle("Welcome to Portal's Rest")
            .setDescription('The bustling town is full of adventurers. What would you like to do?')
            .setImage('https://i.imgur.com/2pCIH22.png');

        const townRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('town-adventure').setLabel('Go on an Adventure').setStyle(ButtonStyle.Success).setEmoji('⚔️'),
            new ButtonBuilder().setCustomId('town-inventory').setLabel('Check Inventory').setStyle(ButtonStyle.Secondary).setEmoji('🎒'),
            new ButtonBuilder().setCustomId('town-leaderboard').setLabel('View Leaderboard').setStyle(ButtonStyle.Primary).setEmoji('🏆'),
            new ButtonBuilder().setCustomId('town-auctionhouse').setLabel('Visit Auction House').setStyle(ButtonStyle.Primary).setEmoji('💰')
        );

        await interaction.update({ content: '', embeds: [townEmbed], components: [townRow] });
        return;
    }

    const userId = interaction.user.id;

    switch (true) {
        case interaction.customId === 'town_market': {
            await interaction.deferUpdate();
            const marketEmbed = simple('💰 The Grand Bazaar', [
                { name: 'Welcome to the Marketplace!', value: 'Here you can buy various goods for your journey.' }
            ]);
            const storeButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('market_store_view').setLabel('Booster Pack Store').setStyle(ButtonStyle.Primary).setEmoji('📦')
            );
            const navigationRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
            );
            await interaction.editReply({ embeds: [marketEmbed], components: [storeButton, navigationRow] });
            break;
        }

        case interaction.customId === 'market_store_view': {
            await interaction.deferUpdate();
            const storeEmbed = simple('🛍️ Booster Pack Store', [
                { name: 'Available Packs', value: 'Choose a pack to acquire new cards!' }
            ]);
            const components = [];
            for (const [packId, packInfo] of Object.entries(BOOSTER_PACKS)) {
                components.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`buy_pack_${packId}`)
                        .setLabel(`${packInfo.name} (${packInfo.cost} ${packInfo.currency === 'soft_currency' ? 'Gold 🪙' : 'Gems 💎'})`)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🛒')
                ));
            }
            const backButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('back_to_market').setLabel('Back to Marketplace').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
            );
            components.push(backButton);
            await interaction.editReply({ embeds: [storeEmbed], components });
            break;
        }

        case interaction.customId.startsWith('buy_pack_'): {
            await interaction.deferUpdate();
            const packId = interaction.customId.replace('buy_pack_', '');
            const packInfo = BOOSTER_PACKS[packId];
            if (!packInfo) {
                await interaction.editReply({ content: 'Invalid pack selected.', ephemeral: true });
                return;
            }

            const [userRows] = await db.execute(`SELECT ${packInfo.currency} FROM users WHERE discord_id = ?`, [userId]);
            const user = userRows[0];

            if (!user || user[packInfo.currency] < packInfo.cost) {
                await interaction.editReply({ content: `You don't have enough ${packInfo.currency === 'soft_currency' ? 'Gold 🪙' : 'Gems 💎'} to buy the ${packInfo.name}! You need ${packInfo.cost}.`, ephemeral: true });
                return;
            }

            await db.execute(
                `UPDATE users SET ${packInfo.currency} = ${packInfo.currency} - ? WHERE discord_id = ?`,
                [packInfo.cost, userId]
            );

            let cardPool = [];
            let count = 1;
            let type = '';
            switch (packInfo.type) {
                case 'hero_pack':
                    cardPool = allPossibleHeroes.filter(h => !h.is_monster);
                    count = 1;
                    type = 'hero';
                    break;
                case 'ability_pack':
                    cardPool = allPossibleAbilities;
                    count = 3;
                    type = 'ability';
                    break;
                case 'weapon_pack':
                    cardPool = allPossibleWeapons;
                    count = 2;
                    type = 'weapon';
                    break;
                case 'armor_pack':
                    cardPool = allPossibleArmors;
                    count = 2;
                    type = 'armor';
                    break;
            }

            const awardedCards = getRandomCardsForPack(cardPool, count, packInfo.rarity);
            const cardNames = [];
            for (const card of awardedCards) {
                cardNames.push(`**${card.name}** (${card.rarity})`);
                try {
                    await db.execute(
                        `INSERT INTO user_inventory (user_id, item_id, quantity, item_type)
                         VALUES (?, ?, 1, ?)
                         ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
                        [userId, card.id, type]
                    );
                } catch (error) {
                    console.error(`Error adding card ${card.id} to inventory for user ${userId} during purchase:`, error);
                }
            }

            const resultsEmbed = simple(`🎉 You bought and opened a ${packInfo.name}!`, [
                { name: 'Cards Received', value: cardNames.join('\n') }
            ]);
            await interaction.editReply({ embeds: [resultsEmbed] });
            await interaction.followUp({ embeds: [confirm('Your new cards have been added to your collection!')], ephemeral: true });
            break;
        }

        case interaction.customId === 'back_to_market': {
            await interaction.deferUpdate();
            const marketEmbed = simple('💰 The Grand Bazaar', [
                { name: 'Welcome to the Marketplace!', value: 'Here you can buy various goods for your journey.' }
            ]);
            const storeButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('market_store_view').setLabel('Booster Pack Store').setStyle(ButtonStyle.Primary).setEmoji('📦')
            );
            const navigationRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('back_to_town').setLabel('Back to Town').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
            );
            await interaction.editReply({ embeds: [marketEmbed], components: [storeButton, navigationRow] });
            break;
        }

        case interaction.customId === 'town-adventure': {
            const adventure = client.commands.get('adventure');
            if (adventure) {
                await adventure.execute(interaction);
            }
            break;
        }

        case interaction.customId === 'back_to_town': {
            await interaction.deferUpdate();
            const { getTownMenu } = require('./commands/town');
            await interaction.editReply(getTownMenu());
            break;
        }
    }
});

client.login(token);
