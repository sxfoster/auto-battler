/* global jest, describe, it, expect, beforeEach */
const React = require('react');
const { render, screen } = require('@testing-library/react');
const BattleHUD = require('../BattleHUD').default;
const { createEventEmitterMock } = require('../__mocks__/phaserSceneMock');
const { usePhaserScene } = require('../../hooks/usePhaserScene');
jest.mock('../../hooks/usePhaserScene');

let scene;

describe('BattleHUD', () => {
  beforeEach(() => {
    scene = createEventEmitterMock();
    usePhaserScene.mockReturnValue(scene);
  });
  it('displays a card-played log entry', () => {
    render(React.createElement(BattleHUD));
    scene.emit('initial-state', {
      order: ['ally1', 'enemy1'],
      combatants: {
        ally1: {
          id: 'ally1',
          name: 'A',
          portraitUrl: '',
          maxHp: 10,
          currentHp: 10,
          currentEnergy: 0,
          type: 'player',
        },
        enemy1: {
          id: 'enemy1',
          name: 'E',
          portraitUrl: '',
          maxHp: 8,
          currentHp: 8,
          currentEnergy: 0,
          type: 'enemy',
        },
      },
    });
    scene.emit('card-played', {
      actorId: 'ally1',
      cardId: 'Slash',
      targetId: 'enemy1',
      cost: 1,
    });
    expect(screen.getByText('A played Slash on E')).toBeInTheDocument();
  });
});
