import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow'
import {
  allPossibleHeroes,
  allPossibleWeapons,
  allPossibleArmors,
  allPossibleAbilities
} from './data/data.js'

function getNextHeroInEvolution(heroId) {
  const currentHero = allPossibleHeroes.find(h => h.id === heroId)
  if (!currentHero || currentHero.rarity === 'Epic') return null
  const evolutionMap = { Common: 'Uncommon', Uncommon: 'Rare', Rare: 'Epic' }
  const nextRarity = evolutionMap[currentHero.rarity]
  return allPossibleHeroes.find(h => h.class === currentHero.class && h.rarity === nextRarity)
}

function checkForAndApplyEvolutions(wins, playerTeam) {
  const thresholds = { 1: true, 2: true, 5: true }
  if (!thresholds[wins]) return false
  let evolved = false
  for (let i = 1; i <= 2; i++) {
    const heroKey = `hero${i}`
    const next = getNextHeroInEvolution(playerTeam[heroKey])
    if (next) {
      playerTeam[heroKey] = next.id
      evolved = true
    }
  }
  return evolved
}

function generateRandomChampion() {
  const commonHeroes = allPossibleHeroes.filter(h => h.rarity === 'Common')
  const hero = commonHeroes[Math.floor(Math.random() * commonHeroes.length)]

  const abilityPool = allPossibleAbilities.filter(
    a => a.class === hero.class && a.rarity === 'Common'
  )
  const ability = abilityPool.length
    ? abilityPool[Math.floor(Math.random() * abilityPool.length)]
    : null

  const commonWeapons = allPossibleWeapons.filter(w => w.rarity === 'Common')
  const weapon = commonWeapons[Math.floor(Math.random() * commonWeapons.length)]

  const commonArmors = allPossibleArmors.filter(a => a.rarity === 'Common')
  const armor = commonArmors[Math.floor(Math.random() * commonArmors.length)]

  return {
    hero: hero.id,
    ability: ability ? ability.id : null,
    weapon: weapon.id,
    armor: armor.id,
  }
}

export const useGameStore = createWithEqualityFn(
  (set, get) => ({
  gamePhase: 'PACK',
  draftStage: 'HERO_1_PACK',
  playerTeam: {
    hero1: null,
    ability1: null,
    weapon1: null,
    armor1: null,
    hero2: null,
    ability2: null,
    weapon2: null,
    armor2: null
  },
  tournament: { wins: 0, losses: 0 },
  inventory: { shards: 0, rerollTokens: 1 },
  packChoices: [],
  revealedCards: [],
  combatants: [],
  battleLog: [],
  isSpeedLinesActive: false,
  // Add these new properties to your initial store state
  playerRole: 'guest', // Default to 'guest'
  participants: [],

  advanceGamePhase: newPhase => set({ gamePhase: newPhase }),
  setSpeedLines: isActive => set({ isSpeedLinesActive: isActive }),

  // Add this new action to your store
  setMultiplayerState: (role, participants) => set({ playerRole: role, participants }),

  // Add this new action to handle updates from the host
  applyHostUpdate: (newLog, newCombatantState) => set(state => ({
    battleLog: [...state.battleLog, ...newLog],
    combatants: newCombatantState,
  })),

  selectHero: heroId => set(state => {
    const team = { ...state.playerTeam }
    let stage = state.draftStage
    if (stage === 'HERO_1_DRAFT') {
      team.hero1 = heroId
      stage = 'ABILITY_1_DRAFT'
    } else if (stage === 'HERO_2_DRAFT') {
      team.hero2 = heroId
      stage = 'ABILITY_2_DRAFT'
    }
    return { playerTeam: team, draftStage: stage }
  }),

  selectWeapon: weaponId => set(state => {
    const team = { ...state.playerTeam }
    let stage = state.draftStage
    if (stage === 'WEAPON_1_DRAFT') {
      team.weapon1 = weaponId
      stage = 'ARMOR_1_DRAFT'
    } else if (stage === 'WEAPON_2_DRAFT') {
      team.weapon2 = weaponId
      stage = 'ARMOR_2_DRAFT'
    }
    return { playerTeam: team, draftStage: stage }
  }),

  handleBattleComplete: didPlayerWin => set(state => {
    const team = { ...state.playerTeam }
    const wins = state.tournament.wins + (didPlayerWin ? 1 : 0)
    const losses = state.tournament.losses + (didPlayerWin ? 0 : 1)
    if (didPlayerWin) {
      checkForAndApplyEvolutions(wins, team)
    }
    const end = wins >= 10 || losses >= 2
    const phase = end ? 'TOURNAMENT_END' : 'UPGRADE'
    return {
      playerTeam: team,
      tournament: { wins, losses },
      gamePhase: phase
    }
  }),

  dismantleCard: card => set(state => {
    const shardValues = { Uncommon: 3, Rare: 5, Epic: 10, Common: 1 }
    const gained = shardValues[card.rarity] || 1
    return { inventory: { ...state.inventory, shards: state.inventory.shards + gained } }
  }),

  equipItem: (slotKey, newId) => set(state => {
    const team = { ...state.playerTeam }
    team[slotKey] = newId
    if (slotKey.startsWith('hero')) {
      const idx = slotKey.endsWith('1') ? '1' : '2'
      team[`ability${idx}`] = null
      team[`weapon${idx}`] = null
      team[`armor${idx}`] = null
    }
    return { playerTeam: team }
  }),

  addRandomHero: () =>
    set(state => {
      const team = { ...state.playerTeam }
      let stage = state.draftStage
      let phase = state.gamePhase

      if (!team.hero1) {
        const champ = generateRandomChampion()
        team.hero1 = champ.hero
        team.ability1 = champ.ability
        team.weapon1 = champ.weapon
        team.armor1 = champ.armor
        stage = 'CHAMPION_1_COMPLETE'
        phase = 'RECAP_1'
      } else if (!team.hero2) {
        const champ = generateRandomChampion()
        team.hero2 = champ.hero
        team.ability2 = champ.ability
        team.weapon2 = champ.weapon
        team.armor2 = champ.armor
        stage = 'CHAMPION_2_COMPLETE'
        phase = 'RECAP_2'
      } else {
        return {}
      }

      return { playerTeam: team, draftStage: stage, gamePhase: phase }
    }),

  debugSkipToBattle: () => {
    const champion1 = generateRandomChampion()
    let champion2 = generateRandomChampion()
    while (champion2.hero === champion1.hero) {
      champion2 = generateRandomChampion()
    }

    set(state => ({
      playerTeam: {
        ...state.playerTeam,
        hero1: champion1.hero,
        ability1: champion1.ability,
        weapon1: champion1.weapon,
        armor1: champion1.armor,
        hero2: champion2.hero,
        ability2: champion2.ability,
        weapon2: champion2.weapon,
        armor2: champion2.armor,
      },
      draftStage: 'COMPLETE',
    }))

    get().startBattle()
  },

  startBattle: () =>
    set(state => {
      const statMap = {
        HP: 'hp',
        ATK: 'attack',
        SPD: 'speed',
        Block: 'block',
        Evasion: 'evasion',
        MagicResist: 'magicResist'
      }

      function createCombatant(hero, weapon, armor, ability, team, position) {
        if (!hero) return null
        const finalStats = {
          hp: hero.hp,
          attack: hero.attack,
          speed: hero.speed,
          block: 0,
          evasion: 0,
          magicResist: 0
        }
        if (weapon?.statBonuses) {
          for (const [stat, value] of Object.entries(weapon.statBonuses)) {
            const key = statMap[stat] || stat.toLowerCase()
            finalStats[key] = (finalStats[key] || 0) + value
          }
        }
        if (armor?.statBonuses) {
          for (const [stat, value] of Object.entries(armor.statBonuses)) {
            const key = statMap[stat] || stat.toLowerCase()
            finalStats[key] = (finalStats[key] || 0) + value
          }
        }
        return {
          id: `${team}-hero-${position}`,
          heroData: hero,
          weaponData: weapon,
          armorData: armor,
          abilityData: ability,
          team,
          position,
          currentHp: finalStats.hp,
          maxHp: finalStats.hp,
          currentEnergy: 0,
          ...finalStats,
          statusEffects: []
        }
      }

      const team = state.playerTeam
      const hero1 = allPossibleHeroes.find(h => h.id === team.hero1)
      const weapon1 = allPossibleWeapons.find(w => w.id === team.weapon1)
      const armor1 = allPossibleArmors.find(a => a.id === team.armor1)
      const ability1 = allPossibleAbilities.find(a => a.id === team.ability1)
      const hero2 = allPossibleHeroes.find(h => h.id === team.hero2)
      const weapon2 = allPossibleWeapons.find(w => w.id === team.weapon2)
      const armor2 = allPossibleArmors.find(a => a.id === team.armor2)
      const ability2 = allPossibleAbilities.find(a => a.id === team.ability2)

      const player1 = createCombatant(hero1, weapon1, armor1, ability1, 'player', 0)
      const player2 = createCombatant(hero2, weapon2, armor2, ability2, 'player', 1)

      // generate enemy team
      let enemyRarity = 'Common'
      if (state.tournament.wins >= 5) enemyRarity = 'Epic'
      else if (state.tournament.wins >= 2) enemyRarity = 'Rare'
      else if (state.tournament.wins >= 1) enemyRarity = 'Uncommon'

      const enemyPool = allPossibleHeroes.filter(h => h.rarity === enemyRarity)
      const enemyHero1 = enemyPool[Math.floor(Math.random() * enemyPool.length)]
      const remaining = enemyPool.filter(h => h.id !== enemyHero1.id)
      const enemyHero2 = remaining[Math.floor(Math.random() * remaining.length)]
      const enemyWeapon1 = allPossibleWeapons[Math.floor(Math.random() * allPossibleWeapons.length)]
      const enemyArmor1 = allPossibleArmors[Math.floor(Math.random() * allPossibleArmors.length)]
      const enemyWeapon2 = allPossibleWeapons[Math.floor(Math.random() * allPossibleWeapons.length)]
      const enemyArmor2 = allPossibleArmors[Math.floor(Math.random() * allPossibleArmors.length)]
      const enemyAbilityPool1 = allPossibleAbilities.filter(a => a.class === enemyHero1.class)
      const enemyAbilityPool2 = allPossibleAbilities.filter(a => a.class === enemyHero2.class)
      const enemyAbility1 = enemyAbilityPool1.length ? enemyAbilityPool1[Math.floor(Math.random() * enemyAbilityPool1.length)] : null
      const enemyAbility2 = enemyAbilityPool2.length ? enemyAbilityPool2[Math.floor(Math.random() * enemyAbilityPool2.length)] : null

      const enemy1 = createCombatant(enemyHero1, enemyWeapon1, enemyArmor1, enemyAbility1, 'enemy', 0)
      const enemy2 = createCombatant(enemyHero2, enemyWeapon2, enemyArmor2, enemyAbility2, 'enemy', 1)

      return { combatants: [player1, player2, enemy1, enemy2], gamePhase: 'BATTLE', battleLog: [] }
    }),

  openPack: () =>
    set(state => {
      const stage = state.draftStage
      const type = stage.split('_')[0]

      let pool = []
      if (type === 'HERO') pool = allPossibleHeroes
      else if (type === 'WEAPON') pool = allPossibleWeapons
      else if (type === 'ARMOR') pool = allPossibleArmors
      else if (type === 'ABILITY') {
        const heroSlot = stage.includes('_1_') ? 'hero1' : 'hero2'
        const heroId = state.playerTeam[heroSlot]
        const heroClass = allPossibleHeroes.find(h => h.id === heroId)?.class
        pool = allPossibleAbilities.filter(a => a.class === heroClass)
      }

      const wins = state.tournament.wins
      let allowed = []
      if (wins <= 1) allowed = ['Common']
      else if (wins <= 3) allowed = ['Common', 'Uncommon']
      else if (wins <= 5) allowed = ['Common', 'Uncommon', 'Rare']
      else allowed = ['Common', 'Uncommon', 'Rare', 'Epic']

      const filtered = pool.filter(p => allowed.includes(p.rarity))
      const shuffled = [...filtered].sort(() => 0.5 - Math.random())
      const num = type === 'HERO' ? 4 : 3
      const choices = shuffled.slice(0, num)

      return { packChoices: choices, gamePhase: 'PACK_OPENING' }
    }),

  finishReveal: () =>
    set(state => ({
      revealedCards: state.packChoices,
      draftStage: state.draftStage.replace('PACK', 'DRAFT'),
      gamePhase: 'DRAFT'
    })),

  startSecondChampionDraft: () =>
    set({ draftStage: 'HERO_2_PACK', gamePhase: 'PACK' }),

  selectDraftCard: card => {
    const state = get()
    const team = { ...state.playerTeam }
    let stage = state.draftStage
    let phase = 'PACK'

    switch (stage) {
      case 'HERO_1_DRAFT':
        team.hero1 = card.id
        stage = 'ABILITY_1_PACK'
        break
      case 'ABILITY_1_DRAFT':
        team.ability1 = card.id
        stage = 'WEAPON_1_PACK'
        break
      case 'WEAPON_1_DRAFT':
        team.weapon1 = card.id
        stage = 'ARMOR_1_PACK'
        break
      case 'ARMOR_1_DRAFT':
        team.armor1 = card.id
        stage = 'CHAMPION_1_COMPLETE'
        phase = 'RECAP_1'
        break
      case 'HERO_2_DRAFT':
        team.hero2 = card.id
        stage = 'ABILITY_2_PACK'
        break
      case 'ABILITY_2_DRAFT':
        team.ability2 = card.id
        stage = 'WEAPON_2_PACK'
        break
      case 'WEAPON_2_DRAFT':
        team.weapon2 = card.id
        stage = 'ARMOR_2_PACK'
        phase = 'PACK'
        break
      case 'ARMOR_2_DRAFT':
        team.armor2 = card.id
        stage = 'CHAMPION_2_COMPLETE'
        phase = 'RECAP_2'
        break
      default:
        break
    }

    set({
      playerTeam: team,
      draftStage: stage,
      packChoices: [],
      revealedCards: [],
      gamePhase: phase
    })

    if (phase === 'BATTLE') {
      get().startBattle()
    }
  }
}), shallow)
