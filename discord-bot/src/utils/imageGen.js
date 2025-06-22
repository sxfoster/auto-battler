const { createCanvas, loadImage } = require('canvas');
const path = require('path');

/**
 * Generate a team image containing up to five hero icons.
 * Each hero should have a corresponding PNG file in the assets directory.
 * @param {string[]} heroes array of hero names without extension
 * @returns {Promise<Buffer>} PNG image buffer
 */
async function makeTeamImage(heroes = []) {
  const width = 300;
  const height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // background
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);

  const max = 5;
  const names = heroes.slice(0, max);
  const iconSize = 48;
  const spacing = width / (names.length + 1);
  const yIcon = 40;
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const imgPath = path.join(__dirname, '..', '..', 'assets', `${name}.png`);
    let img;
    try {
      img = await loadImage(imgPath);
    } catch {
      continue; // skip missing images
    }
    const x = spacing * (i + 1) - iconSize / 2;
    ctx.drawImage(img, x, yIcon, iconSize, iconSize);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, x + iconSize / 2, yIcon + iconSize + 14);
  }

  return canvas.toBuffer('image/png');
}

module.exports = { makeTeamImage };
