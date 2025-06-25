const sharp = require('sharp');

/**
 * Generates a simple card image for a hero.
 * Currently creates an SVG placeholder with the hero's name.
 * @param {{ name: string }} hero
 * @returns {Promise<Buffer>}
 */
async function generateCardImage(hero) {
  const svg = `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="400" fill="#1e293b"/>
    <text x="150" y="200" font-size="32" fill="white" text-anchor="middle" font-family="Arial, Helvetica, sans-serif">${hero.name}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

module.exports = { generateCardImage };
