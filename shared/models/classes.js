export const Role = {
  Tank: 'Tank',
  Healer: 'Healer',
  Support: 'Support',
  DPS: 'DPS',
}

export const classes = [
  {
    name: 'Guardian',
    description: 'Sturdy protector that draws enemy attacks and shields allies.',
    role: Role.Tank,
    allowedCards: ['shield_wall', 'taunt'],
  },
  {
    name: 'Warrior',
    description: 'Aggressive melee combatant excelling at frontline skirmishes.',
    role: Role.Tank,
    allowedCards: ['power_strike', 'battle_cry'],
  },
  {
    name: 'Runestone Sentinel',
    description: 'Tank that channels rune magic to harden defenses.',
    role: Role.Tank,
    allowedCards: ['rune_slam', 'stone_guard'],
  },
  {
    name: 'Cleric',
    description: 'Devout healer who mends wounds with holy magic.',
    role: Role.Healer,
    allowedCards: ['holy_light', 'smite'],
  },
  {
    name: 'Herbalist',
    description: 'Nature healer brewing restorative and toxic concoctions.',
    role: Role.Healer,
    allowedCards: ['healing_herbs', 'toxic_spores'],
  },
  {
    name: 'Bloodweaver',
    description: 'Mystic manipulating life essence to heal or harm.',
    role: Role.Healer,
    allowedCards: ['blood_leech', 'sanguine_gift'],
  },
  {
    name: 'Bard',
    description: 'Inspirational performer empowering allies through song.',
    role: Role.Support,
    allowedCards: ['inspire', 'song_of_swiftness'],
  },
  {
    name: 'Chronomancer',
    description: 'Temporal magician bending time to aid the party.',
    role: Role.Support,
    allowedCards: ['time_warp', 'temporal_strike'],
  },
  {
    name: 'Totem Warden',
    description: 'Places totems that bolster friends or weaken foes.',
    role: Role.Support,
    allowedCards: ['totem_of_vitality', 'totem_of_fury'],
  },
  {
    name: 'Blademaster',
    description: 'Master of blades delivering relentless attacks.',
    role: Role.DPS,
    allowedCards: ['quick_slash', 'blade_fury'],
  },
  {
    name: 'Wizard',
    description: 'Arcane caster wielding destructive and protective spells.',
    role: Role.DPS,
    allowedCards: ['arcane_bolt', 'mana_shield'],
  },
  {
    name: 'Shadowblade',
    description: 'Stealthy assassin striking from the darkness.',
    role: Role.DPS,
    allowedCards: ['backstab', 'smoke_bomb'],
  },
  {
    name: 'Ranger',
    description: 'Expert archer adept at controlling the battlefield.',
    role: Role.DPS,
    allowedCards: ['arrow_shot', 'entangling_trap'],
  },
  {
    name: 'Pyromancer',
    description: 'Sorcerer harnessing fire for offense and defense.',
    role: Role.DPS,
    allowedCards: ['fireball', 'flame_shield'],
  },
]
