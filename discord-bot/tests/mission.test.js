jest.mock('fs');
jest.mock('../src/services/missionService', () => ({
  getPlayerId: jest.fn(),
  startMission: jest.fn(),
  recordChoice: jest.fn(),
  completeMission: jest.fn()
}));

const fs = require('fs');
const missionService = require('../src/services/missionService');
const mission = require('../commands/mission');

describe('mission command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates thread and progresses rounds', async () => {
    const data = {
      id: 1,
      name: 'test',
      intro: 'Intro',
      rounds: [
        { text: 'r1', options: [{ text: 'a', durability: -1 }, { text: 'b' }] },
        { text: 'r2', options: [{ text: 'a' }, { text: 'b' }] },
        { text: 'r3', options: [{ text: 'a' }, { text: 'b' }] }
      ],
      rewards: { gold: 5 },
      codexFragment: 'frag'
    };

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(data));

    missionService.getPlayerId.mockResolvedValue(10);
    missionService.startMission.mockResolvedValue(20);

    const send = jest.fn().mockResolvedValue();
    const create = jest.fn().mockResolvedValue({ send });

    const interaction = {
      options: {
        getSubcommand: jest.fn().mockReturnValue('start'),
        getString: jest.fn().mockReturnValue('test')
      },
      user: { id: 'u1' },
      channel: { threads: { create } },
      reply: jest.fn().mockResolvedValue()
    };

    await mission.execute(interaction);

    expect(create).toHaveBeenCalled();
    expect(send).toHaveBeenCalledTimes(data.rounds.length + 2);
    expect(missionService.recordChoice).toHaveBeenCalledTimes(data.rounds.length);
    expect(missionService.completeMission).toHaveBeenCalledWith(
      20,
      expect.any(String),
      data.rewards,
      data.codexFragment,
      10
    );
  });
});
