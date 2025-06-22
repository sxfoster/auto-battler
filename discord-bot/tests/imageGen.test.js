const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { makeTeamImage } = require('../src/utils/imageGen');

describe('makeTeamImage', () => {
  const heroes = ['Hero1', 'Hero2', 'Hero3', 'Hero4', 'Hero5'];
  const assetsDir = path.join(__dirname, '..', 'assets');

  beforeAll(() => {
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    // create simple colored square icons for each hero
    heroes.forEach((name, i) => {
      const canvas = createCanvas(48, 48);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = `hsl(${i * 60},100%,50%)`;
      ctx.fillRect(0, 0, 48, 48);
      fs.writeFileSync(path.join(assetsDir, `${name}.png`), canvas.toBuffer());
    });
  });

  afterAll(() => {
    heroes.forEach(name => {
      const p = path.join(assetsDir, `${name}.png`);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  });

  test('returns Buffer for 1-5 names', async () => {
    for (let i = 1; i <= 5; i++) {
      const buf = await makeTeamImage(heroes.slice(0, i));
      expect(Buffer.isBuffer(buf)).toBe(true);
      expect(buf.length).toBeGreaterThan(1000); // png should have some size
    }
  });

  test('icons drawn at expected positions', async () => {
    const buf = await makeTeamImage(heroes.slice(0, 3));
    const img = await loadImage(buf);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const width = 300;
    const iconSize = 48;
    const spacing = width / 4; // for 3 heroes
    const y = 40 + iconSize / 2;
    for (let i = 0; i < 3; i++) {
      const centerX = spacing * (i + 1);
      const data = ctx.getImageData(centerX, y, 1, 1).data;
      // background is 17,17,17
      expect(data[0] === 17 && data[1] === 17 && data[2] === 17).toBe(false);
    }
  });
});
