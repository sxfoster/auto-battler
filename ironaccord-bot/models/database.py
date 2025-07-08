from mysql.connector import pooling
from dotenv import load_dotenv
import os

load_dotenv()

_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_DATABASE'),
}

_pool = pooling.MySQLConnectionPool(
    pool_name='ironaccord_pool',
    pool_size=10,
    **_config
)

print('✅ Database connection pool created.')


def query(sql, params=None):
    conn = _pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(sql, params or ())
        if cursor.with_rows:
            rows = cursor.fetchall()
        else:
            conn.commit()
            rows = []
        insert_id = cursor.lastrowid if cursor.lastrowid else None
        return {'insertId': insert_id, 'rows': rows}
    finally:
        cursor.close()
        conn.close()


def get_connection():
    return _pool.get_connection()
