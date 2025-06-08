/* global jest, describe, it, expect */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
// Add test to verify initial-state hydration and card-played logs
import { createEventEmitterMock } from '../__mocks__/phaserSceneMock';
let usePhaserScene;
jest.unstable_mockModule('../../hooks/usePhaserScene', () => ({ usePhaserScene: jest.fn() }));

let scene;

describe('BattleHUD', () => {
  beforeEach(async () => {
    scene = createEventEmitterMock();
    ({ usePhaserScene } = await import('../../hooks/usePhaserScene'));
    usePhaserScene.mockReturnValue(scene);
  });

  it.skip('hydrates combatants on initial-state', async () => {
    const { default: HUD } = await import('../BattleHUD.jsx');
    render(React.createElement(HUD));
    scene.emit('initial-state', {
      order: ['c1'],
      combatants: {
        c1: { id: 'c1', name: 'Hero', portraitUrl: '', maxHp: 10, currentHp: 10, currentEnergy: 0, type: 'player' },
      },
    });
    expect(screen.getByText('Hero')).toBeInTheDocument();
  });
  it.skip('displays a card-played log entry', async () => {
    const { default: HUD } = await import('../BattleHUD.jsx');
    render(React.createElement(HUD));
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

