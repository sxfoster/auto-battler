# Phaser Battle Flow Audit

This document lists the files currently relying on Phaser or imperative scene logic and explains how battle event data flows into the React UI. It also notes tight coupling points that complicate testing.

## Files Referencing Phaser or Imperative Logic

- `client/src/components/GameView.tsx`
- `client/src/routes/ReplayBattle.jsx`
- `client/src/hooks/usePhaserScene.js`
- `client/src/components/BattleHUD.jsx`
- `client/src/phaser/DungeonScene.ts`
- `client/src/phaser/effects.ts`
- `client/src/components/BattleScene.tsx`
- `client/src/components/DungeonMap.tsx`
- `client/src/components/CombatPage.tsx`
- `client/src/components/DungeonPage.tsx`
- `game/src/scenes/BattleScene.js`
- `game/src/effects.js`
- `game/src/index.js`

## Current Battle Event Flow

`game/src/scenes/BattleScene.js` calls `simulateBattle()` to generate an array of events. It emits an `initial-state` event with the party and enemy data, then schedules the rest of the events using `time.delayedCall`. React components like `BattleHUD` listen to these Phaser scene events to update their own state. The Phaser scene runs inside the `<GameView>` component which places a canvas in the DOM.

## Coupling & Testing Concerns

- A global `window.__phaserGame` reference is used by React hooks such as `usePhaserScene` to access scenes.
- React components depend on Phaser event emitters and DOM events (e.g. `window.addEventListener('battleState', ...)`) rather than direct data props.
- Timers (`setTimeout`, `time.delayedCall`) drive animation order which makes deterministic testing difficult.
- State is mutated inside scenes and read via global references, creating implicit dependencies between React and Phaser.

Moving toward a pure React viewer will reduce these couplings and allow deterministic rendering driven by a structured battle log.
