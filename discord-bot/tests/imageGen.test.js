const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { makeTeamImage } = require('../src/utils/imageGen');

describe('makeTeamImage', () => {
  const heroes = ['Hero1', 'Hero2', 'Hero3', 'Hero4', 'Hero5'];
  const assetsDir = path.join(__dirname, '..', 'assets');

  beforeAll(async () => {
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    // create simple colored square icons for each hero using sharp
    for (const [i, name] of heroes.entries()) {
      const buffer = await sharp({
        create: { width: 48, height: 48, channels: 4, background: `hsl(${i * 60},100%,50%)` }
      }).png().toBuffer();
      fs.writeFileSync(path.join(assetsDir, `${name}.png`), buffer);
    }
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
      expect(buf.length).toBeGreaterThan(1000);
    }
  });

  test('image dimensions and overlays', async () => {
    const selected = heroes.slice(0, 3);
    const buf = await makeTeamImage(selected);
    const meta = await sharp(buf).metadata();
    expect(meta.width).toBe(300);
    expect(meta.height).toBe(200);

    const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const getPixel = (x, y) => {
      const idx = (y * info.width + x) * info.channels;
      return [data[idx], data[idx + 1], data[idx + 2]];
    };
    const bg = [31, 31, 31];
    for (let i = 0; i < selected.length; i++) {
      const x = 10 + i * 60 + 24;
      const y = 10 + 24;
      const pixel = getPixel(x, y);
      expect(pixel[0] === bg[0] && pixel[1] === bg[1] && pixel[2] === bg[2]).toBe(false);
    }
  });
});
