# React-Driven Battle HUD

## Event Schema
- `initial-state`  
- `turn-start`  
- `card-played`  
- `turn-skipped`  
- `battle-end`  

## Component Architecture
- `Battle.tsx` – embeds Phaser canvas & `<BattleHUD />`  
- `BattleHUD.jsx` – subscribes to events, holds React state  
- `CombatantCard.jsx` – displays portrait, HP/energy bars  
- `LogLine.jsx` – renders individual log entries  
- `Overlay.jsx` – victory/defeat/draw modal  

## Styling Guide
- Flex layout: allies/log/enemies  
- Color tokens, font sizes, grid gaps  

## Accessibility
- ARIA roles on combatant cards and log  
- Keyboard navigable focus styles  
