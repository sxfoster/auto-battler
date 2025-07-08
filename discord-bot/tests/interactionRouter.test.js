jest.mock('../src/utils/missionEngine', () => ({ resolveChoice: jest.fn() }));
jest.mock('../src/services/itemService', () => ({
  reduceDurability: jest.fn(),
  addItem: jest.fn()
}));
jest.mock('../src/services/userService', () => ({
  addFlag: jest.fn(),
  addCodexFragment: jest.fn()
}));

const missionEngine = require('../src/utils/missionEngine');
const itemService = require('../src/services/itemService');
const userService = require('../src/services/userService');
const { handleChoice } = require('../src/utils/interactionRouter');

beforeEach(() => {
  jest.clearAllMocks();
});

test('updates db based on missionEngine result', async () => {
  missionEngine.resolveChoice.mockResolvedValue({
    durability_loss: 2,
    flags: ['injured'],
    loot: ['sword'],
    codex: ['frag1']
  });

  await handleChoice(1, { item_id: 10 });

  expect(itemService.reduceDurability).toHaveBeenCalledWith(10, 2);
  expect(userService.addFlag).toHaveBeenCalledWith(1, 'injured');
  expect(itemService.addItem).toHaveBeenCalledWith(1, 'sword');
  expect(userService.addCodexFragment).toHaveBeenCalledWith(1, 'frag1');
});

test('handles missing optional fields', async () => {
  missionEngine.resolveChoice.mockResolvedValue({});

  await handleChoice(2, {});

  expect(itemService.reduceDurability).not.toHaveBeenCalled();
  expect(userService.addFlag).not.toHaveBeenCalled();
  expect(itemService.addItem).not.toHaveBeenCalled();
  expect(userService.addCodexFragment).not.toHaveBeenCalled();
});
