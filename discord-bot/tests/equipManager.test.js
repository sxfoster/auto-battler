const { MessageFlags } = require('discord.js');
const equipManager = require('../features/equipManager');
const db = require('../util/database');

jest.mock('../util/database', () => ({
  execute: jest.fn()
}));

describe('startEquipFlow', () => {
  test('persists selections and sends confirmation embed', async () => {
    db.execute
      .mockResolvedValueOnce([[{ starter_class: 'Warrior' }]])
      .mockResolvedValueOnce([[{ item_id: 10, name: 'Slash', effect: 'Hit' }, { item_id: 11, name: 'Block', effect: 'Defend' }]])
      .mockResolvedValueOnce([[{ id: 1 }]])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const update = jest.fn().mockResolvedValue();
    const message = { awaitMessageComponent: jest.fn(() => Promise.resolve({ values: ['10','11'], update })) };
    const interaction = { followUp: jest.fn(() => Promise.resolve(message)), user: { id: '123' } };

    await equipManager.startEquipFlow(interaction, '123');

    expect(db.execute).toHaveBeenCalledWith('DELETE FROM champion_decks WHERE user_champion_id = ?', [1]);
    expect(db.execute).toHaveBeenCalledWith('INSERT INTO champion_decks (user_champion_id, ability_id, order_index) VALUES (?, ?, ?)', [1, 10, 0]);
    expect(db.execute).toHaveBeenCalledWith('INSERT INTO champion_decks (user_champion_id, ability_id, order_index) VALUES (?, ?, ?)', [1, 11, 1]);
    const embed = update.mock.calls[0][0].embeds[0];
    expect(embed.data.title).toBe('Abilities Equipped');
  });
});
