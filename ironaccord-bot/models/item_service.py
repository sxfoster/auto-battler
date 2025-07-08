from . import database as db

async def reduce_durability(player_id: int, amount: int) -> None:
    res = await db.query('SELECT equipped_weapon_id, equipped_armor_id, equipped_ability_id FROM players WHERE id = %s', [player_id])
    if not res['rows']:
        return
    player = res['rows'][0]
    if player.get('equipped_weapon_id'):
        await db.query('UPDATE user_weapons SET durability = GREATEST(durability - %s, 0) WHERE id = %s', [amount, player['equipped_weapon_id']])
    if player.get('equipped_armor_id'):
        await db.query('UPDATE user_armors SET durability = GREATEST(durability - %s, 0) WHERE id = %s', [amount, player['equipped_armor_id']])
    if player.get('equipped_ability_id'):
        await db.query('UPDATE user_ability_cards SET durability = GREATEST(durability - %s, 0) WHERE id = %s', [amount, player['equipped_ability_id']])

