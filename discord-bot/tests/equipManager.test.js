const equipManager = require('../features/equipManager');
const db = require('../util/database');
const embedBuilder = require('../src/utils/embedBuilder');

jest.mock('../util/database', () => ({
  execute: jest.fn()
}));

jest.mock('../src/utils/embedBuilder', () => ({
  simple: jest.fn(() => ({ data: {} }))
}));

describe('startEquipFlow', () => {
  test('persists selected ability IDs and sends confirmation embed', async () => {
    const selectInteraction = { customId: 'equip_select', values: ['1', '2'], deferUpdate: jest.fn().mockResolvedValue() };
    const confirmInteraction = { customId: 'equip_confirm', update: jest.fn().mockResolvedValue(), deferUpdate: jest.fn().mockResolvedValue() };

    const message = { awaitMessageComponent: jest.fn()
      .mockResolvedValueOnce(selectInteraction)
      .mockResolvedValueOnce(confirmInteraction) };
    const interaction = { followUp: jest.fn(() => Promise.resolve(message)) };

    db.execute
      .mockResolvedValueOnce([[{ class: 'Mage' }]])
      .mockResolvedValueOnce([[{ item_id: 1, name: 'Bolt', effect: 'Zap' }, { item_id: 2, name: 'Fireball', effect: 'Burn' }]])
      .mockResolvedValueOnce([[{ id: 42 }]])
      .mockResolvedValue([]);

    await equipManager.startEquipFlow(interaction, 'user');

    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO champion_decks'), [42, 1, 0]);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO champion_decks'), [42, 2, 1]);
    expect(embedBuilder.simple).toHaveBeenCalledWith('Abilities Equipped', expect.any(Array));
    expect(confirmInteraction.update).toHaveBeenCalledWith(expect.objectContaining({ embeds: [expect.any(Object)] }));
  });
});
