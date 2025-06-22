const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Create a composite image of heroes using Sharp
 * @param {string[]} heroes
 * @returns {Promise<Buffer>}
 */
async function makeTeamImage(heroes) {
  const width = 300, height = 200;
  // Start with a dark background
  let svgBackground = `<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="#1f1f1f"/></svg>`;
  let background = Buffer.from(svgBackground);
  // Load hero icons as Sharp overlays
  const composites = heroes.slice(0,5).map((hero, i) => {
    const iconBuffer = fs.readFileSync(
      path.resolve(__dirname, '../../assets', `${hero}.png`)
    );
    return {
      input: iconBuffer,
      top: 10,
      left: 10 + i * 60,
      blend: 'over'
    };
  });
  // Add text labels using SVG overlay
  const textOverlays = heroes.slice(0,5).map((hero, i) => {
    const x = 10 + i * 60;
    const y = 70;
    return `<text x="${x}" y="${y}" fill="#fff" font-size="12">${hero}</text>`;
  }).join('');
  const svgText = `<svg width="${width}" height="${height}">${textOverlays}</svg>`;
  composites.push({ input: Buffer.from(svgText), blend: 'over' });
  return await sharp(background)
    .composite(composites)
    .png()
    .toBuffer();
}

module.exports = { makeTeamImage };
