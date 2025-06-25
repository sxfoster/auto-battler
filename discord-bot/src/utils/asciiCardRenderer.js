const CARD_BORDER = "╔═════════════════════╗\n";
const CARD_MIDDLE = "║                     ║\n";
const CARD_BOTTOM = "╚═════════════════════╝\n";

function generateAsciiCard(cardName, rarity) {
    const paddedName = cardName.padEnd(21, ' ').substring(0, 21);
    const paddedRarity = `Rarity: ${rarity}`.padEnd(21, ' ').substring(0, 21);

    return "```\n" +
        CARD_BORDER +
        CARD_MIDDLE.replace(' ', '█') +
        `║ ${paddedName} ║\n` +
        `║                     ║\n` +
        `║                     ║\n` +
        `║   ${paddedRarity}   ║\n` +
        CARD_MIDDLE.replace(' ', '▓') +
        CARD_BOTTOM +
        "```";
}

module.exports = { generateAsciiCard };
