# Known Issues & Resolutions

A running log of critical bugs and their fixes, so new contributors can learn from our history and avoid regressions.

---

## 1. React Router Pages Blank Until F5  
**Symptom:** Town, Party, Battle, Inventory routes rendered empty on client‐side navigation; only a hard reload populated them.  
**Root Cause:** `useEffect(() => loadState(), [])` hooks fired only on initial mount; React Router re-used components on path changes.  
**Resolution:** Keyed `<Routes key={location.pathname}>…</Routes>` in `App.jsx` so each route fully remounts, ensuring load hooks run every navigation.

---

## 2. Auto-Battle Didn’t Log Cards  
**Symptom:** Battle log showed only “Party attacks goblin…” repeatedly, never naming the actual card played.  
**Root Cause:** Initiative-queue path called `performCardAction()` with an empty deck, bypassing our `resolveCard()` instrumentation.  
**Resolution:** In `update()` replaced that stub with real card selection from `data.hand` and unified on `this.resolveCard()`, which includes `appendToBattleLog()` calls.

---

## 3. Health Bar Clipped by Card Container  
**Symptom:** HP bars on battle cards had their bottoms chopped off by the card’s rounded corners.  
**Root Cause:** `.battle-card` container used `overflow:hidden` with insufficient bottom padding.  
**Resolution:** Added `margin-bottom:0.8rem` to `.battle-card-hpbar` (and increased parent padding) so bars never sat flush to the clipped edge.

---

## 4. Party Setup State Not Persisting  
**Symptom:** After assigning classes and navigating away, returning to Party Setup didn’t show saved changes.  
**Root Cause:** Component didn’t load `partyState` from `localStorage` on mount.  
**Resolution:** Added `useEffect(() => loadPartyState(), [])` in `PartySetup.jsx` and `TownHub.jsx` to rehydrate state on every visit.

---

## 5. Dungeon Fog-of-War Misbehavior  
**Symptom:** Phaser dungeon scene didn’t reveal tiles correctly; transitions were janky.  
**Root Cause:** Static tile drawing without alpha or tweening, and missing persistence load on route changes.  
**Resolution:**  
- In `dungeonState.js`, persisted state to `localStorage` and `loadDungeon()` on mount.  
- In `DungeonScene.js`, used `rect.setAlpha(0.2)` + tweens and camera fades.  
- In React `Dungeon.jsx`, gated clicks by `revealed = visited || adjacent`.

---

*…and so on as we add more entries…*

