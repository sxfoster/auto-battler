const clericPortrait = new URL('../images/cleric-portrait.png', import.meta.url).href
const warriorPortrait = new URL('../images/warrior-portrait.png', import.meta.url).href
const guardianPortrait = new URL('../images/guardian-portrait.png', import.meta.url).href
const blademasterPortrait = new URL('../images/blademaster-portrait.png', import.meta.url).href
const bloodweaverPortrait = new URL('../images/bloodweaver-portrait.png', import.meta.url).href
const chronomancerPortrait = new URL('../images/chronomancer-portrait.png', import.meta.url).href
const herbalistPortrait = new URL('../images/herbalist-portrait.png', import.meta.url).href
const rangerPortrait = new URL('../images/ranger-portrait.png', import.meta.url).href
const shadowbladePortrait = new URL('../images/shadowblade-portrait.png', import.meta.url).href
const pyromancerPortrait = new URL('../images/pyromancer-portrait.png', import.meta.url).href
const totemWardenPortrait = new URL('../images/totem_warrior-portrait.png', import.meta.url).href
const defaultPortrait = new URL('../images/default-portrait.png', import.meta.url).href

export const Role = {
  Tank: 'Tank',
  Healer: 'Healer',
  Support: 'Support',
  DPS: 'DPS',
}

export const classes = [
  {
    id: 'Guardian',
    name: 'Guardian',
    description: 'Sturdy protector that draws enemy attacks and shields allies.',
    role: Role.Tank,
    allowedCards: [
      'fortified_stance',
      'intervene',
      'guards_challenge',
      'bulwark',
    ],
    portrait: guardianPortrait,
  },
  {
    id: 'Warrior',
    name: 'Warrior',
    description: 'Aggressive melee combatant excelling at frontline skirmishes.',
    role: Role.Tank,
    allowedCards: ['strike', 'iron_sword', 'shield_wall', 'taunt'],
    portrait: warriorPortrait,
  },
  {
    id: 'RunestoneSentinel',
    name: 'Runestone Sentinel',
    description: 'Tank that channels rune magic to harden defenses.',
    role: Role.Tank,
    allowedCards: ['rune_slam', 'stone_guard', 'earthen_grasp', 'runic_pulse'],
    portrait: defaultPortrait,
  },
  {
    id: 'Cleric',
    name: 'Cleric',
    description: 'Devout healer who mends wounds with holy magic.',
    role: Role.Healer,
    allowedCards: ['heal', 'holy_light', 'smite', 'sanctuary'],
    portrait: clericPortrait,
  },
  {
    id: 'Herbalist',
    name: 'Herbalist',
    description: 'Nature healer brewing restorative and toxic concoctions.',
    role: Role.Healer,
    allowedCards: ['haste_elixir', 'healing_herbs', 'toxic_spores', 'growth_burst'],
    portrait: herbalistPortrait,
  },
  {
    id: 'Bloodweaver',
    name: 'Bloodweaver',
    description: 'Mystic manipulating life essence to heal or harm.',
    role: Role.Healer,
    allowedCards: ['blood_leech', 'sanguine_gift', 'hemorrhage', 'blood_pact'],
    portrait: bloodweaverPortrait,
  },
  {
    id: 'Bard',
    name: 'Bard',
    description: 'Inspirational performer empowering allies through song.',
    role: Role.Support,
    allowedCards: ['inspire', 'song_of_swiftness', 'lullaby', 'motivational_tune'],
    portrait: defaultPortrait,
  },
  {
    id: 'Chronomancer',
    name: 'Chronomancer',
    description: 'Temporal magician bending time to aid the party.',
    role: Role.Support,
    allowedCards: ['time_warp', 'temporal_strike', 'rewind', 'accelerate'],
    portrait: chronomancerPortrait,
  },
  {
    id: 'TotemWarden',
    name: 'Totem Warden',
    description: 'Places totems that bolster friends or weaken foes.',
    role: Role.Support,
    allowedCards: ['totem_of_vitality', 'totem_of_fury', 'totem_of_stoneskin', 'totem_recall'],
    portrait: totemWardenPortrait,
  },
  {
    id: 'Blademaster',
    name: 'Blademaster',
    description: 'Master of blades delivering relentless attacks.',
    role: Role.DPS,
    allowedCards: ['quick_slash', 'blade_fury', 'deflect', 'deadly_focus'],
    portrait: blademasterPortrait,
  },
  {
    id: 'Wizard',
    name: 'Wizard',
    description: 'Arcane caster wielding destructive and protective spells.',
    role: Role.DPS,
    allowedCards: ['arcane_bolt', 'mana_shield', 'frost_nova', 'energize'],
    portrait: defaultPortrait,
  },
  {
    id: 'Shadowblade',
    name: 'Shadowblade',
    description: 'Stealthy assassin striking from the darkness.',
    role: Role.DPS,
    allowedCards: ['mark_target', 'shadow_execution', 'backstab', 'smoke_bomb'],
    portrait: shadowbladePortrait,
  },
  {
    id: 'Ranger',
    name: 'Ranger',
    description: 'Expert archer adept at controlling the battlefield.',
    role: Role.DPS,
    allowedCards: ['arrow_shot', 'entangling_trap', 'mark_target', 'eagle_eye'],
    portrait: rangerPortrait,
  },
  {
    id: 'Pyromancer',
    name: 'Pyromancer',
    description: 'Sorcerer harnessing fire for offense and defense.',
    role: Role.DPS,
    allowedCards: ['fireball', 'flame_shield', 'ignite', 'cauterize'],
    portrait: pyromancerPortrait,
  },
]
