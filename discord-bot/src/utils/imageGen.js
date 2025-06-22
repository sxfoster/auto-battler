const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const WIDTH = 300;
const HEIGHT = 200;
const MAX_HEROES = 5;
const ASSETS_DIR = path.resolve(__dirname, '../../assets/heroes');

/**
 * Generates a composite image showing each hero with a label.
 * Hero icons are loaded from `assets/heroes/{hero}.png`.
 *
 * @param {string[]} heroes Names of heroes to display
 * @returns {Promise<Buffer>} PNG buffer of the team image
 */
async function makeTeamImage(heroes) {
  if (!Array.isArray(heroes) || heroes.length === 0) {
    throw new Error('Hero list cannot be empty');
  }

  const backgroundSvg = `<svg width="${WIDTH}" height="${HEIGHT}"><rect width="100%" height="100%" fill="#1f1f1f"/></svg>`;
  const composites = [];
  const selected = heroes.slice(0, MAX_HEROES);

  for (let i = 0; i < selected.length; i++) {
    const hero = selected[i];
    try {
      const iconBuffer = fs.readFileSync(path.join(ASSETS_DIR, `${hero}.png`));
      composites.push({
        input: iconBuffer,
        top: 10,
        left: 10 + i * 60,
        blend: 'over'
      });
    } catch (err) {
      throw new Error(`Missing asset for hero: ${hero}`);
    }
  }

  const labels = selected
    .map((name, i) => `<text x="${10 + i * 60}" y="70" fill="#fff" font-size="12">${name}</text>`)
    .join('');
  const textSvg = `<svg width="${WIDTH}" height="${HEIGHT}">${labels}</svg>`;
  composites.push({ input: Buffer.from(textSvg), blend: 'over' });

  return sharp(Buffer.from(backgroundSvg))
    .composite(composites)
    .png()
    .toBuffer();
}

module.exports = { makeTeamImage };
