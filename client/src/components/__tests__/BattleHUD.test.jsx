import React from 'react';
import { render, screen } from '@testing-library/react';
import BattleHUD from '../BattleHUD';
import { createEventEmitterMock } from '../__mocks__/phaserSceneMock';

const scene = createEventEmitterMock();
jest.mock('../hooks/usePhaserScene', () => ({
  usePhaserScene: () => scene,
}));

describe('BattleHUD', () => {
  it('displays a card-played log entry', () => {
    render(<BattleHUD />);
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
