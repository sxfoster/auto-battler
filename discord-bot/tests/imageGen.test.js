const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { makeTeamImage } = require('../src/utils/imageGen');

const assetsDir = path.join(__dirname, '..', 'assets', 'heroes');
const heroes = ['hero-1', 'hero-2', 'hero-3', 'hero-4', 'hero-5'];

describe('makeTeamImage', () => {
  beforeAll(async () => {
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    for (const [i, name] of heroes.entries()) {
      const buffer = await sharp({
        create: {
          width: 48,
          height: 48,
          channels: 4,
          background: `hsl(${i * 60},100%,50%)`
        }
      })
        .png()
        .toBuffer();
      fs.writeFileSync(path.join(assetsDir, `${name}.png`), buffer);
    }
  });

  afterAll(() => {
    heroes.forEach(name => {
      const p = path.join(assetsDir, `${name}.png`);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  });

  test('returns Buffer for 1-5 heroes', async () => {
    for (let i = 1; i <= heroes.length; i++) {
      const buf = await makeTeamImage(heroes.slice(0, i));
      const meta = await sharp(buf).metadata();
      expect(Buffer.isBuffer(buf)).toBe(true);
      expect(meta.width).toBe(300);
      expect(meta.height).toBe(200);
    }
  });

  test('rejects empty array', async () => {
    await expect(makeTeamImage([])).rejects.toThrow('Hero list cannot be empty');
  });

  test('missing-file input', async () => {
    await expect(makeTeamImage(['missing-hero'])).rejects.toThrow(
      'Missing asset for hero: missing-hero'
    );
  });
});
