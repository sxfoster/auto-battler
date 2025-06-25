const sharp = require('sharp');
const path = require('path');

/**
 * Generate a card image buffer by compositing the frame, art and text.
 * @param {object} cardObject Card definition containing at least `name`, `rarity`, `art` and stat fields.
 * @returns {Promise<Buffer>} PNG buffer of the composed card image.
 */
async function generateCardImage(cardObject) {
  if (!cardObject) throw new Error('cardObject is required');

  const rarity = String(cardObject.rarity || 'common').toLowerCase();
  const framePath = path.resolve(__dirname, '..', '..', 'assets', 'frames', `frame-${rarity}.png`);

  let artPath = cardObject.art || '';
  // Strip leading ../ if present and resolve relative to assets directory
  artPath = artPath.replace(/^\.\.\//, '');
  artPath = path.resolve(__dirname, '..', '..', 'assets', artPath);

  const frame = sharp(framePath);
  const artBuffer = await sharp(artPath).resize(300, 400, { fit: 'contain' }).toBuffer();

  const textSvg = `
    <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
      <style>
        .name { fill: white; font-size: 24px; font-weight: bold; font-family: sans-serif; }
        .rarity { fill: white; font-size: 16px; font-family: sans-serif; }
        .stats { fill: white; font-size: 14px; font-family: sans-serif; }
        .ability { fill: white; font-size: 12px; font-family: sans-serif; }
      </style>
      <text x="150" y="30" text-anchor="middle" class="name">${cardObject.name}</text>
      <text x="150" y="55" text-anchor="middle" class="rarity">${cardObject.rarity}</text>
      <text x="10" y="360" class="stats">HP: ${cardObject.hp ?? '--'} ATK: ${cardObject.attack ?? '--'} SPD: ${cardObject.speed ?? '--'}</text>
      ${cardObject.ability ? `<text x="10" y="380" class="ability">${cardObject.ability.name}: ${cardObject.ability.description || cardObject.ability.effect || ''}</text>` : ''}
    </svg>
  `;

  const svgBuffer = Buffer.from(textSvg);

  const composed = await frame
    .composite([
      { input: artBuffer, top: 0, left: 0 },
      { input: svgBuffer, top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  return composed;
}

module.exports = { generateCardImage };
