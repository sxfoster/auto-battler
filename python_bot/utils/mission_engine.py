import random

from .. import database
from ..data.items import BY_NAME


def roll_d20():
    return random.randint(1, 20)


async def load_stats(player_id):
    rows = await database.query(
        'SELECT stat, value FROM user_stats WHERE player_id = ?', [player_id]
    )
    return {row['stat']: row['value'] for row in rows}


async def load_equipped(player_id):
    rows = await database.query(
        'SELECT equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE id = ?',
        [player_id],
    )
    return rows[0] if rows else {}


async def load_bonus(table, item_id):
    if not item_id:
        return 0
    rows = await database.query(f'SELECT name FROM {table} WHERE id = ?', [item_id])
    if not rows:
        return 0
    item = BY_NAME.get(rows[0]['name'])
    return item['bonus'] if item and isinstance(item.get('bonus'), (int, float)) else 0


async def resolve_choice(player_id, choice):
    stats = await load_stats(player_id)
    equipped = await load_equipped(player_id)

    weapon_bonus = await load_bonus('user_weapons', equipped.get('equipped_weapon_id'))
    armor_bonus = await load_bonus('user_armors', equipped.get('equipped_armor_id'))
    ability_bonus = await load_bonus('user_ability_cards', equipped.get('equipped_ability_id'))
    gear_bonus = weapon_bonus + armor_bonus + ability_bonus

    stat_bonus = stats.get(choice.get('stat'), 0) if choice.get('stat') else 0
    roll = roll_d20()
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

    result = {'tier': tier}
    if choice.get('rewards') and tier == 'success':
        result['rewards'] = choice['rewards']
    if choice.get('penalties') and tier == 'fail':
        result['penalties'] = choice['penalties']
    if 'outcomes' in choice and tier in choice['outcomes']:
        o = choice['outcomes'][tier]
        if 'rewards' in o:
            result['rewards'] = o['rewards']
        if 'penalties' in o:
            result['penalties'] = o['penalties']
    return result
