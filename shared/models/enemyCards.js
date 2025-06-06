export const enemyCards = [
  // Blood Witch cards
  { id: 'blood_boil', name: 'Blood Boil', archetype: 'Blood Witch', cost: 1, effect: '2 dark damage; heal self 2 if cursed', target: 'Enemy', duration: 'Instant', notes: '' },
  { id: 'hex_of_weakness', name: 'Hex of Weakness', archetype: 'Blood Witch', cost: 1, effect: '-2 ATK and DEF', target: 'Enemy', duration: '2 turns', notes: '' },
  { id: 'blood_pact', name: 'Blood Pact', archetype: 'Blood Witch', cost: 1, effect: 'Lose 2 HP, heal ally 4', target: 'Ally', duration: 'Instant', notes: '' },
  { id: 'vile_mending', name: 'Vile Mending', archetype: 'Blood Witch', cost: 1, effect: 'Cleanse curses, heal 4', target: 'Self', duration: 'Instant', notes: '' },
  { id: 'dark_benediction', name: 'Dark Benediction', archetype: 'Blood Witch', cost: 2, effect: 'All allies +1 damage and take +1 damage', target: 'All Allies', duration: '2 turns', notes: '' },

  // Brute cards
  { id: 'crushing_blow', name: 'Crushing Blow', archetype: 'Brute', cost: 1, effect: '4 damage', target: 'Enemy', duration: 'Instant', notes: '' },
  { id: 'slam', name: 'Slam', archetype: 'Brute', cost: 2, effect: '2 damage and Stun', target: 'Enemy', duration: '1 turn', notes: '' },
  { id: 'armor_break', name: 'Armor Break', archetype: 'Brute', cost: 1, effect: '2 damage, remove shield & -2 DEF', target: 'Enemy', duration: '2 turns', notes: '' },
  { id: 'war_shout', name: 'War Shout', archetype: 'Brute', cost: 1, effect: 'Taunt all enemies, gain +2 DEF', target: 'Self', duration: '1 turn', notes: '' },
  { id: 'juggernaut_rush', name: 'Juggernaut Rush', archetype: 'Brute', cost: 2, effect: '2 AoE damage, gain Shield 5', target: 'All Enemies/Self', duration: 'Instant', notes: '' },

  // Frost Revenant cards
  { id: 'frostbolt', name: 'Frostbolt', archetype: 'Frost Revenant', cost: 1, effect: '2 cold damage and Slow', target: 'Enemy', duration: '2 turns', notes: '' },
  { id: 'glacial_chains', name: 'Glacial Chains', archetype: 'Frost Revenant', cost: 1, effect: 'Root target, prevent actions', target: 'Enemy', duration: '1 turn', notes: '' },
  { id: 'blizzard', name: 'Blizzard', archetype: 'Frost Revenant', cost: 2, effect: '1 AoE cold damage, Slow all enemies', target: 'All Enemies', duration: '1 turn', notes: '' },
  { id: 'ice_shield', name: 'Ice Shield', archetype: 'Frost Revenant', cost: 1, effect: 'Shield 5, immune to Slow', target: 'Self', duration: '2 turns', notes: '' },
  { id: 'shatter', name: 'Shatter', archetype: 'Frost Revenant', cost: 1, effect: '4 damage to slowed or frozen target', target: 'Enemy', duration: 'Instant', notes: '' },

  // Grave Titan cards
  { id: 'titanic_slam', name: 'Titanic Slam', archetype: 'Grave Titan', cost: 2, effect: '3 damage and knockback', target: 'Enemy', duration: '1 turn', notes: '' },
  { id: 'bone_plating', name: 'Bone Plating', archetype: 'Grave Titan', cost: 1, effect: 'Gain 8 Shield', target: 'Self', duration: '2 turns', notes: '' },
  { id: 'earthquake', name: 'Earthquake', archetype: 'Grave Titan', cost: 2, effect: '2 AoE damage, -1 initiative', target: 'All Enemies', duration: '1 turn', notes: '' },
  { id: 'siege_step', name: 'Siege Step', archetype: 'Grave Titan', cost: 1, effect: 'Taunt, next attack +2 damage', target: 'Self', duration: '1 turn', notes: '' },
  { id: 'devour', name: 'Devour', archetype: 'Grave Titan', cost: 1, effect: 'Heal 4 if below 50% HP', target: 'Self', duration: 'Instant', notes: '' },

  // Infernal Beast cards
  { id: 'inferno_breath', name: 'Inferno Breath', archetype: 'Infernal Beast', cost: 2, effect: '2 AoE fire damage and Burn', target: 'All Enemies', duration: '2 turns', notes: '' },
  { id: 'rampage', name: 'Rampage', archetype: 'Infernal Beast', cost: 1, effect: '4 damage, lose 2 HP', target: 'Enemy', duration: 'Instant', notes: '' },
  { id: 'flame_shield_enemy', name: 'Flame Shield', archetype: 'Infernal Beast', cost: 1, effect: 'Shield 5, reflect 1 fire dmg', target: 'Self', duration: '2 turns', notes: '' },
  { id: 'wild_roar', name: 'Wild Roar', archetype: 'Infernal Beast', cost: 1, effect: 'All enemies -2 DEF, self +1 initiative', target: 'All Enemies/Self', duration: '1 turn', notes: '' },
  { id: 'sear_flesh', name: 'Sear Flesh', archetype: 'Infernal Beast', cost: 1, effect: '2 fire damage, target cannot heal', target: 'Enemy', duration: '2 turns', notes: '' },

  // Necromancer cards
  { id: 'summon_skeleton', name: 'Summon Skeleton', archetype: 'Necromancer', cost: 2, effect: 'Add Skeleton Minion to battle', target: 'Self/Field', duration: 'Permanent', notes: 'Extra attacker' },
  { id: 'fear', name: 'Fear', archetype: 'Necromancer', cost: 2, effect: 'Target skips next turn', target: 'Enemy', duration: '1 turn', notes: '' },
  { id: 'grave_touch', name: 'Grave Touch', archetype: 'Necromancer', cost: 1, effect: '2 damage, heal 2 if enemy KO\'d', target: 'Enemy', duration: 'Instant', notes: '' },
  { id: 'bone_armor', name: 'Bone Armor', archetype: 'Necromancer', cost: 1, effect: 'Gain Shield 5', target: 'Self', duration: '2 turns', notes: '' },
  { id: 'death_pulse', name: 'Death Pulse', archetype: 'Necromancer', cost: 2, effect: '2 AoE dark damage, -1 initiative', target: 'All Enemies', duration: '1 turn', notes: '' },

  // Plague Bringer cards
  { id: 'plague_cloud', name: 'Plague Cloud', archetype: 'Plague Bringer', cost: 2, effect: '1 AoE poison damage, -50% healing', target: 'All Enemies', duration: '2 turns', notes: '' },
  { id: 'infection', name: 'Infection', archetype: 'Plague Bringer', cost: 1, effect: '2 poison damage, target cannot heal', target: 'Enemy', duration: '2 turns', notes: '' },
  { id: 'virulent_burst', name: 'Virulent Burst', archetype: 'Plague Bringer', cost: 1, effect: 'Spread all debuffs to all enemies', target: 'Enemy', duration: 'Instant', notes: '' },
  { id: 'rotting_touch', name: 'Rotting Touch', archetype: 'Plague Bringer', cost: 1, effect: '1 damage and Weak (-2 ATK)', target: 'Enemy', duration: '2 turns', notes: '' },
  { id: 'malignant_aura', name: 'Malignant Aura', archetype: 'Plague Bringer', cost: 2, effect: 'All enemies lose 1 HP/turn', target: 'All Enemies', duration: '2 turns', notes: '' },

  // Shadowfiend cards
  { id: 'shadowstep', name: 'Shadowstep', archetype: 'Shadowfiend', cost: 1, effect: 'Untargetable, +2 crit chance', target: 'Self', duration: '1 turn', notes: '' },
  { id: 'ambush', name: 'Ambush', archetype: 'Shadowfiend', cost: 2, effect: '4 damage (+2 if undetected)', target: 'Enemy', duration: 'Instant', notes: '' },
  { id: 'eviscerate', name: 'Eviscerate', archetype: 'Shadowfiend', cost: 1, effect: '2 damage and Bleed', target: 'Enemy', duration: '2 turns', notes: '' },
  { id: 'cloak_of_dusk', name: 'Cloak of Dusk', archetype: 'Shadowfiend', cost: 1, effect: 'Gain 5 shield, +30% dodge', target: 'Self', duration: '2 turns', notes: '' },
  { id: 'mark_for_death', name: 'Mark for Death', archetype: 'Shadowfiend', cost: 1, effect: 'Next attack on target double dmg', target: 'Enemy', duration: '1 turn', notes: '' },

  // Storm Serpent cards
  { id: 'chain_lightning', name: 'Chain Lightning', archetype: 'Storm Serpent', cost: 2, effect: '2 AoE lightning damage and Shock', target: 'All Enemies', duration: '1 turn', notes: '' },
  { id: 'static_field', name: 'Static Field', archetype: 'Storm Serpent', cost: 1, effect: 'All enemies take 1 damage on their turn', target: 'All Enemies', duration: '2 turns', notes: '' },
  { id: 'flash_strike', name: 'Flash Strike', archetype: 'Storm Serpent', cost: 1, effect: '3 damage, gain +1 initiative', target: 'Enemy', duration: '1 turn', notes: '' },
  { id: 'electric_coil', name: 'Electric Coil', archetype: 'Storm Serpent', cost: 1, effect: 'Stun target', target: 'Enemy', duration: '1 turn', notes: '' },
  { id: 'storm_surge', name: 'Storm Surge', archetype: 'Storm Serpent', cost: 1, effect: 'All allies +1 initiative', target: 'All Allies', duration: '1 turn', notes: '' },

  // Venomspawn cards
  { id: 'venomous_strike', name: 'Venomous Strike', archetype: 'Venomspawn', cost: 1, effect: '2 poison damage, 1/turn', target: 'Enemy', duration: '2 turns', notes: '' },
  { id: 'root_snare', name: 'Root Snare', archetype: 'Venomspawn', cost: 1, effect: 'Root target, prevent movement', target: 'Enemy', duration: '1 turn', notes: '' },
  { id: 'neurotoxin', name: 'Neurotoxin', archetype: 'Venomspawn', cost: 1, effect: 'Target cannot heal', target: 'Enemy', duration: '2 turns', notes: '' },
  { id: 'acid_spit', name: 'Acid Spit', archetype: 'Venomspawn', cost: 2, effect: '1 AoE acid damage, -2 DEF', target: 'All Enemies', duration: '1 turn', notes: '' },
  { id: 'molt', name: 'Molt', archetype: 'Venomspawn', cost: 1, effect: 'Remove all debuffs from self', target: 'Self', duration: 'Instant', notes: 'Cleanse' },

  // Void Horror cards
  { id: 'reality_tear', name: 'Reality Tear', archetype: 'Void Horror', cost: 1, effect: '3 arcane damage, shuffle target deck', target: 'Enemy', duration: 'Instant', notes: '' },
  { id: 'null_pulse', name: 'Null Pulse', archetype: 'Void Horror', cost: 2, effect: 'All enemies lose 2 energy', target: 'All Enemies', duration: 'Instant', notes: 'Resource drain' },
  { id: 'warp_echo', name: 'Warp Echo', archetype: 'Void Horror', cost: 1, effect: 'Copy last ability used by enemy', target: 'Enemy', duration: 'Instant', notes: 'Mimic' },
  { id: 'paranoia', name: 'Paranoia', archetype: 'Void Horror', cost: 1, effect: 'Enemy attacks ally instead', target: 'Enemy', duration: '1 turn', notes: 'Mind control' },
  { id: 'entropic_field', name: 'Entropic Field', archetype: 'Void Horror', cost: 2, effect: 'Remove all buffs from enemies', target: 'All Enemies', duration: 'Instant', notes: 'Strip positive effects' },
]
