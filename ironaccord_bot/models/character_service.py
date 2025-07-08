from typing import Dict, Any, List

from . import database as db

FLAG_DATA: Dict[str, Dict[str, Any]] = {
    'Injured': {
        'name': 'Injured',
        'emoji': '\ud83e\udd15',
        'statBonuses': {'FOR': -1}
    },
    'Well-Fed': {
        'name': 'Well-Fed',
        'emoji': '\ud83c\udf57',
        'statBonuses': {'MGT': 1}
    }
}

CODEX_DATA: Dict[str, Dict[str, Any]] = {
    'ancient-tech': {
        'name': 'Ancient Tech',
        'emoji': '\ud83d\udcdc',
        'statBonuses': {'ING': 2}
    },
    'martial-training': {
        'name': 'Martial Training',
        'emoji': '\u2694\ufe0f',
        'statBonuses': {'MGT': 1}
    }
}

async def get_character_sheet(discord_id: str) -> Dict[str, Any] | None:
    res = await db.query(
        'SELECT id, level, equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE discord_id = %s',
        [discord_id]
    )
    if not res['rows']:
        return None
    player = res['rows'][0]
    player_id = player['id']

    stat_res, flag_res, codex_res = await db.query(
        'SELECT stat, value FROM user_stats WHERE player_id = %s', [player_id]
    ), await db.query('SELECT flag FROM user_flags WHERE player_id = %s', [player_id]), await db.query('SELECT entry_key FROM codex_entries WHERE player_id = %s', [player_id])

    stats = { 'MGT': 0, 'AGI': 0, 'FOR': 0, 'INTU': 0, 'RES': 0, 'ING': 0 }
    for row in stat_res['rows']:
        stats[row['stat']] = row['value']

    flags = [r['flag'] for r in flag_res['rows']]
    codex = [r['entry_key'] for r in codex_res['rows']]

    weapon_res = player['equipped_weapon_id'] and await db.query('SELECT name FROM user_weapons WHERE id = %s', [player['equipped_weapon_id']]) or {'rows': []}
    armor_res = player['equipped_armor_id'] and await db.query('SELECT name FROM user_armors WHERE id = %s', [player['equipped_armor_id']]) or {'rows': []}
    ability_res = player['equipped_ability_id'] and await db.query('SELECT name FROM user_ability_cards WHERE id = %s', [player['equipped_ability_id']]) or {'rows': []}

    for flag in flags:
        data = FLAG_DATA.get(flag)
        if data and data.get('statBonuses'):
            for stat, bonus in data['statBonuses'].items():
                stats[stat] = stats.get(stat, 0) + bonus

    for entry in codex:
        data = CODEX_DATA.get(entry)
        if data and data.get('statBonuses'):
            for stat, bonus in data['statBonuses'].items():
                stats[stat] = stats.get(stat, 0) + bonus

    gear = {
        'weapon': weapon_res['rows'][0]['name'] if weapon_res['rows'] else None,
        'armor': armor_res['rows'][0]['name'] if armor_res['rows'] else None,
        'ability': ability_res['rows'][0]['name'] if ability_res['rows'] else None,
    }

    return { 'level': player['level'], 'stats': stats, 'gear': gear, 'flags': flags, 'codex': codex }

