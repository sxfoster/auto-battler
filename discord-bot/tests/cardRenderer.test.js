const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { generateCardImage } = require('../src/utils/cardRenderer');

const assetsDir = path.join(__dirname, '..', 'assets');
const framesDir = path.join(assetsDir, 'frames');

beforeAll(async () => {
  await fs.mkdir(framesDir, { recursive: true });
  const frameBuffer = await sharp({
    create: {
      width: 300,
      height: 400,
      channels: 4,
      background: { r: 30, g: 60, b: 90, alpha: 1 }
    }
  }).png().toBuffer();
  await fs.writeFile(path.join(framesDir, 'frame-common.png'), frameBuffer);
});

afterAll(async () => {
  await fs.rm(framesDir, { recursive: true, force: true });
});

describe('generateCardImage', () => {
  test('produces consistent card image', async () => {
    const card = {
      name: 'Test Hero',
      class: 'Warrior',
      rarity: 'Common',
      hp: 10,
      attack: 5,
      speed: 3
    };
    const buffer = await generateCardImage(card);
    expect(buffer.toString('base64')).toMatchSnapshot();
  });
});
