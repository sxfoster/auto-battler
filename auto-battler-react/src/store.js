import { create } from 'zustand'
import { allPossibleHeroes } from './data/data.js'

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

export const useGameStore = create(set => ({
  gamePhase: 'PACK',
  draftStage: 'HERO_1_DRAFT',
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

  advanceGamePhase: newPhase => set({ gamePhase: newPhase }),

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
  })
}))
