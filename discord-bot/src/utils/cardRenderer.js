const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

/**
 * Generate a card image buffer using rarity frames and art assets.
 * @param {object} card The card object containing name, class, rarity and stats.
 * @returns {Promise<Buffer>}
 */
async function generateCardImage(card) {
  const assetsBase = path.join(__dirname, '..', '..', 'assets');
  const framePath = path.join(
    assetsBase,
    'frames',
    `frame-${(card.rarity || 'common').toLowerCase()}.png`
  );
  const heroArtPath = path.join(
    assetsBase,
    'heroes',
    `${card.name.toLowerCase().replace(/\s+/g, '_')}_card.png`
  );
  const classIconPath = path.join(
    assetsBase,
    'classes',
    `${(card.class || 'generic').toLowerCase().replace(/\s+/g, '-')}.png`
  );

  const base = sharp(framePath).resize(300, 400);
  const composites = [];

  let artToUse = null;
  try {
    await fs.access(heroArtPath);
    artToUse = heroArtPath;
  } catch {
    try {
      await fs.access(classIconPath);
      artToUse = classIconPath;
    } catch {
      artToUse = null;
    }
  }

  if (artToUse) {
    composites.push({ input: artToUse });
  }

  const textSvg = `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <style>
    .name { fill: white; font-size: 24px; font-weight: bold; font-family: Arial, Helvetica, sans-serif; text-anchor: middle; }
    .stats { fill: white; font-size: 16px; font-family: Arial, Helvetica, sans-serif; text-anchor: middle; }
  </style>
  <text x="150" y="340" class="name">${card.name}</text>
  <text x="150" y="365" class="stats">HP: ${card.hp}  ATK: ${card.attack}  SPD: ${card.speed}</text>
</svg>`;

  composites.push({ input: Buffer.from(textSvg) });

  return base.composite(composites).png().toBuffer();
}

module.exports = { generateCardImage };
