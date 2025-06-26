const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

/**
 * Generate a card image buffer using rarity frames and art assets.
 * @param {object} card The card object containing name, class, rarity and stats.
 * @returns {Promise<Buffer>}
 */
async function generateCardImage(card) {
  // This function generates a card image based on the provided card data.
  // It returns a PNG buffer representing the card.
  const assetsBase = path.join(__dirname, '..', '..', 'assets');
  const framePath = path.join(
    assetsBase,
    'frames',
    `frame-${(card.rarity || 'common').toLowerCase()}.png`
  );
  const heroArtPath = path.join(
    assetsBase,
    'heroes',
    `${card.name.toLowerCase().replace(/\s+/g, '_')}.png`
  );
  const classIconPath = path.join(
    assetsBase,
    'classes',
    `${(card.class || 'generic').toLowerCase().replace(/\s+/g, '-')}.png`
  );

  console.log(
    `Generating card image for ${card.name} - frame: ${framePath}, hero: ${heroArtPath}, class: ${classIconPath}`
  );

  // Start with the rarity frame as the base image
  let base = sharp(framePath).resize(300, 400);

  let artToUse = null;
  try {
    await fs.access(heroArtPath);
    console.log(`Using hero art for ${card.name}: ${heroArtPath}`);
    artToUse = heroArtPath;
  } catch {
    console.log(`Hero art not found at ${heroArtPath}`);
    try {
      await fs.access(classIconPath);
      console.log(`Using class icon for ${card.name}: ${classIconPath}`);
      artToUse = classIconPath;
    } catch {
      console.log(`Class icon not found at ${classIconPath}`);
      artToUse = null;
    }
  }

  if (artToUse) {
    // Place character art above the frame but below the stats text
    base = base.composite([{ input: artToUse, top: 50, left: 25 }]);
  } else {
    console.log(`No art asset found for ${card.name}`);
  }

  const textSvg = `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <style>
    .name { fill: white; font-size: 24px; font-weight: bold; font-family: Arial, Helvetica, sans-serif; text-anchor: middle; }
    .stats { fill: white; font-size: 16px; font-family: Arial, Helvetica, sans-serif; text-anchor: middle; }
  </style>
  <text x="150" y="340" class="name">${card.name}</text>
  <text x="150" y="381" class="stats">HP: ${card.hp}  ATK: ${card.attack}  SPD: ${card.speed}</text>
</svg>`;

  // Removed rarity label overlay
  // base = base.composite([{ input: Buffer.from(raritySvg) }]);

  return base.composite([{ input: Buffer.from(textSvg) }]).png().toBuffer();
}

/**
 * Generate a composite image buffer for a pack of cards displayed side-by-side.
 * @param {object[]} cards Array of card objects
 * @returns {Promise<Buffer>}
 */
async function generatePackImage(cards) {
  const cardImages = await Promise.all(cards.map(card => generateCardImage(card)));
  const PADDING = 15;
  const CARD_WIDTH = 300;
  const CARD_HEIGHT = 400;
  const totalWidth = (CARD_WIDTH * cardImages.length) + (PADDING * (cardImages.length + 1));
  const totalHeight = CARD_HEIGHT + (PADDING * 2);

  const compositeImage = sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  const compositeOps = cardImages.map((img, i) => ({
    input: img,
    left: i * CARD_WIDTH + (i + 1) * PADDING,
    top: PADDING
  }));

  return compositeImage.composite(compositeOps).png().toBuffer();
}

/**
 * Generate a simple sealed booster image so the bot doesn't rely on any static assets.
 * @returns {Promise<Buffer>}
 */
async function generateSealedBoosterImage() {
  const WIDTH = 300;
  const HEIGHT = 400;
  const base = sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 70, g: 60, b: 110, alpha: 1 }
    }
  });

  const textSvg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="100%" height="100%" rx="20" ry="20" fill="none" stroke="white" stroke-width="4"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="36" fill="white">Booster</text>
    <text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="28" fill="white">Pack</text>
  </svg>`;

  return base.composite([{ input: Buffer.from(textSvg) }]).png().toBuffer();
}

module.exports = { generateCardImage, generatePackImage, generateSealedBoosterImage };
