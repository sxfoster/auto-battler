const leaderboard = require('../commands/leaderboard');

jest.mock('../src/utils/userService', () => ({
  getLeaderboardData: jest.fn()
}));
const userService = require('../src/utils/userService');

test('replies with leaderboard embed', async () => {
  userService.getLeaderboardData.mockResolvedValue([
    { name: 'Alice', pve_wins: 5, pve_losses: 1, pvp_wins: 2, pvp_losses: 0, pve_ratio: 5/1, pvp_ratio: 2+99999 },
    { name: 'Bob', pve_wins: 3, pve_losses: 0, pvp_wins: 1, pvp_losses: 1, pve_ratio: 3+99999, pvp_ratio: 1 },
    { name: 'Cara', pve_wins: 1, pve_losses: 1, pvp_wins: 0, pvp_losses: 2, pve_ratio: 1, pvp_ratio: 0 }
  ]);
  const interaction = { reply: jest.fn().mockResolvedValue() };
  await leaderboard.execute(interaction);
  expect(userService.getLeaderboardData).toHaveBeenCalled();
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ embeds: expect.any(Array) }));
});
