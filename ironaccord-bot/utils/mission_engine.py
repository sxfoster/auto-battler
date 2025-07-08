import random
from typing import Dict, Any

from models import database as db
from .items import BY_NAME

async def resolve_choice(player_id: int, choice: Dict[str, Any]) -> Dict[str, Any]:
    stats_res = await db.query('SELECT stat, value FROM user_stats WHERE player_id = %s', [player_id])
    stats = {row['stat']: row['value'] for row in stats_res['rows']}

    eq = await db.query('SELECT equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE id = %s', [player_id])
    eq_row = eq['rows'][0] if eq['rows'] else {}

    async def load_bonus(table: str, item_id: int | None) -> int:
        if not item_id:
            return 0
        res = await db.query(f'SELECT name FROM {table} WHERE id = %s', [item_id])
        if not res['rows']:
            return 0
        item = BY_NAME.get(res['rows'][0]['name'])
        return item['bonus'] if item and isinstance(item.get('bonus'), int) else 0

    weapon_bonus = await load_bonus('user_weapons', eq_row.get('equipped_weapon_id'))
    armor_bonus = await load_bonus('user_armors', eq_row.get('equipped_armor_id'))
    ability_bonus = await load_bonus('user_ability_cards', eq_row.get('equipped_ability_id'))
    gear_bonus = weapon_bonus + armor_bonus + ability_bonus

    stat_bonus = stats.get(choice.get('stat'), 0) if choice.get('stat') else 0
    roll = random.randint(1, 20)
    total = roll + stat_bonus + gear_bonus
    dc = choice.get('dc', 10)

    if roll == 1:
        tier = 'critical_fail'
    elif roll == 20:
        tier = 'critical_success'
    elif total >= dc:
        tier = 'success'
    else:
        tier = 'fail'

    result: Dict[str, Any] = {'tier': tier}
    if choice.get('rewards') and tier == 'success':
        result['rewards'] = choice['rewards']
    if choice.get('penalties') and tier == 'fail':
        result['penalties'] = choice['penalties']
    if choice.get('outcomes') and choice['outcomes'].get(tier):
        o = choice['outcomes'][tier]
        if 'rewards' in o:
            result['rewards'] = o['rewards']
        if 'penalties' in o:
            result['penalties'] = o['penalties']
    return result

