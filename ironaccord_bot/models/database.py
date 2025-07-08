import os
import aiomysql
from typing import Any, Dict, List, Optional

_pool: Optional[aiomysql.Pool] = None

async def get_pool() -> aiomysql.Pool:
    global _pool
    if _pool is None:
        _pool = await aiomysql.create_pool(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            db=os.getenv('DB_DATABASE'),
            autocommit=True,
            minsize=1,
            maxsize=10,
        )
    return _pool

async def query(sql: str, params: Optional[List[Any]] = None) -> Dict[str, Any]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(sql, params or [])
            if cur.description:
                rows = await cur.fetchall()
            else:
                rows = []
            insert_id = cur.lastrowid
    return {'insertId': insert_id, 'rows': rows}
