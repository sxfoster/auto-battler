import { useState, useCallback, useEffect } from 'react';

const MAX_ENERGY = 10;

function getEffectiveSpeed(combatant) {
  let spd = combatant.speed || 0;
  combatant.statusEffects.forEach((s) => {
    if (s.name === 'Slow') spd -= 1;
  });
  return spd;
}

function computeTurnQueue(state) {
  return state
    .filter((c) => c.currentHp > 0)
    .sort((a, b) => getEffectiveSpeed(b) - getEffectiveSpeed(a))
    .map((c) => c.id);
}

function applyStatus(target, statusName, turns, log) {
  const existing = target.statusEffects.find((s) => s.name === statusName);
  if (existing) existing.turnsRemaining += turns;
  else target.statusEffects.push({ name: statusName, turnsRemaining: turns });
  if (log) log(`${target.name} is afflicted with ${statusName}!`);
}

function calculateDamage(attacker, target, baseDamage) {
  let dmg = baseDamage;
  if (attacker.statusEffects.some((s) => s.name === 'Attack Up')) dmg += 2;

  let block = target.block || 0;
  if (target.statusEffects.some((s) => s.name === 'Defense Down')) block = Math.max(0, block - 1);
  if (target.statusEffects.some((s) => s.name === 'Burn')) block = Math.max(0, block - 1);
  dmg = Math.max(1, dmg - block);

  if (target.statusEffects.some((s) => s.name === 'Vulnerable')) dmg += 1;
  return dmg;
}

export default function useBattleLogic(initialCombatants = [], eventHandlers = {}) {
  const { onAttack } = eventHandlers
  const [battleState, setBattleState] = useState(() =>
    initialCombatants.map(c => ({ ...c }))
  );
  const [turnQueue, setTurnQueue] = useState(() => computeTurnQueue(initialCombatants));

  useEffect(() => {
    setBattleState(initialCombatants.map(c => ({ ...c })))
    setTurnQueue(computeTurnQueue(initialCombatants))
  }, [initialCombatants])
  const [battleLog, setBattleLog] = useState([]);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const log = useCallback((msg) => setBattleLog((l) => [...l, msg]), []);

  const removeFromQueue = (id, queue) => queue.filter((q) => q !== id);

  const applyDamage = (attacker, target, baseDamage, queue) => {
    const dmg = calculateDamage(attacker, target, baseDamage)

    if (onAttack) onAttack(attacker.id, target.id, dmg)

    target.currentHp = Math.max(0, target.currentHp - dmg)
    const aName = attacker.heroData?.name || attacker.name
    const tName = target.heroData?.name || target.name
    log(`${aName} hits ${tName} for ${dmg} damage.`)
    if (target.currentHp <= 0) {
      log(`${tName} is defeated.`)
      queue = removeFromQueue(target.id, queue)
    }
    return queue
  }

  const processStatuses = (combatant) => {
    let skip = false;

    combatant.statusEffects.forEach((s) => {
      switch (s.name) {
        case 'Poison':
          combatant.currentHp = Math.max(0, combatant.currentHp - 2);
          log(`${combatant.name} suffers 2 poison damage.`);
          break;
        case 'Bleed':
          combatant.currentHp = Math.max(0, combatant.currentHp - 2);
          log(`${combatant.name} suffers 2 bleed damage.`);
          break;
        case 'Burn':
          combatant.currentHp = Math.max(0, combatant.currentHp - 2);
          log(`${combatant.name} suffers 2 burn damage.`);
          break;
        default:
          break;
      }
    });

    if (combatant.statusEffects.some((s) => s.name === 'Stun')) {
      log(`${combatant.name} is stunned and misses the turn.`);
      skip = true;
    }

    if (combatant.statusEffects.some((s) => s.name === 'Root')) {
      log(`${combatant.name} is rooted and cannot act.`);
      skip = true;
    }

    if (!skip && combatant.statusEffects.some((s) => s.name === 'Confuse') && Math.random() < 0.5) {
      log(`${combatant.name} is confused and fumbles their turn.`);
      skip = true;
    }

    combatant.statusEffects = combatant.statusEffects
      .map((s) => ({ ...s, turnsRemaining: s.turnsRemaining - 1 }))
      .filter((s) => s.turnsRemaining > 0);

    return skip;
  };

  const checkVictory = (state) => {
    const playerAlive = state.some((c) => c.team === 'player' && c.currentHp > 0);
    const enemyAlive = state.some((c) => c.team === 'enemy' && c.currentHp > 0);
    if (!playerAlive || !enemyAlive) {
      setIsBattleOver(true);
      setWinner(playerAlive ? 'player' : 'enemy');
      log(`${playerAlive ? 'Player' : 'Enemy'} team wins the battle!`);
      return true;
    }
    return false;
  };

  const processTurn = useCallback(() => {
    if (isBattleOver) return;

    setBattleState((prevState) => {
      const state = prevState.map((c) => ({ ...c, statusEffects: [...c.statusEffects] }));
      let queue = [...turnQueue];
      if (queue.length === 0) queue = computeTurnQueue(state);

      let attackerId = queue.shift();
      let attacker = state.find((c) => c.id === attackerId);
      while (attacker && attacker.currentHp <= 0 && queue.length) {
        attackerId = queue.shift();
        attacker = state.find((c) => c.id === attackerId);
      }
      if (!attacker || attacker.currentHp <= 0) {
        setTurnQueue(queue);
        return state;
      }

      const skip = processStatuses(attacker);
      if (attacker.currentHp <= 0) {
        queue = removeFromQueue(attacker.id, queue);
        setTurnQueue(queue);
        return state;
      }
      if (!skip) {
        const targets = state.filter((c) => c.team !== attacker.team && c.currentHp > 0);
        if (targets.length === 0) {
          setTurnQueue(queue);
          return state;
        }
        const ability = attacker.abilityData;
        let usedAbility = false;
        if (ability && attacker.currentEnergy >= ability.energyCost) {
          usedAbility = true;
          attacker.currentEnergy -= ability.energyCost;

          const shocked = attacker.statusEffects.some((s) => s.name === 'Shock') && Math.random() < 0.5;
          if (shocked) {
            log(`${attacker.name}'s ability fizzles due to shock!`);
          } else {
            log(`${attacker.name} uses ${ability.name}!`);
            const dmgMatch = ability.effect.match(/(\d+)/);
            const base = dmgMatch ? parseInt(dmgMatch[1], 10) : attacker.attack;
            if (ability.target === 'ENEMIES') {
              targets.forEach((t) => {
                queue = applyDamage(attacker, t, base, queue);
                if (ability.name === 'Firestorm') applyStatus(t, 'Burn', 2, log);
              });
            } else {
              const target = targets[0];
              queue = applyDamage(attacker, target, base, queue);
              if (ability.name === 'Shield Bash') {
                applyStatus(target, 'Stun', 1, log);
              } else if (['Elemental Rift', 'Frozen Grasp', 'Entangle'].includes(ability.name)) {
                applyStatus(target, 'Root', 1, log);
              } else if (ability.name === 'Judgment') {
                applyStatus(target, 'Defense Down', 2, log);
              }
            }
          }
        }

        if (!usedAbility) {
          const target = targets[0];
          queue = applyDamage(attacker, target, attacker.attack, queue);
        }
        attacker.currentEnergy = Math.min(MAX_ENERGY, attacker.currentEnergy + 1);
      }

      setTurnQueue(queue);
      checkVictory(state);
      return state;
    });
  }, [turnQueue, isBattleOver, log]);

  return { battleState, battleLog, isBattleOver, winner, processTurn };
}

