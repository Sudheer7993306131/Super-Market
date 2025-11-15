import sqlite3
import psycopg2
from psycopg2.extras import execute_batch

SQLITE_PATH = "db.sqlite3"
POSTGRES_URL = "postgresql://se_kxtb_user:7wnCdgNjrz0zGwLVUW6pUoNWJDZWCeGu@dpg-d4c9r9odl3ps73bc76fg-a.oregon-postgres.render.com/se_kxtb"

sqlite_conn = sqlite3.connect(SQLITE_PATH)
pg_conn = psycopg2.connect(POSTGRES_URL)

sqlite_cur = sqlite_conn.cursor()
pg_cur = pg_conn.cursor()

sqlite_cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = sqlite_cur.fetchall()

SKIP_TABLES = ["sqlite_sequence", "django_migrations"]

def convert_boolean_values(columns, row):
    """Convert SQLite integers (0/1) to Python booleans for Postgres boolean fields."""
    new_row = []
    for col_name, value in zip(columns, row):
        # auto-detect boolean fields by `${col_name}` heuristic
        if col_name.startswith("is_") or col_name.startswith("has_"):
            if value in (0, 1):
                new_row.append(bool(value))
                continue
        new_row.append(value)
    return tuple(new_row)

for table in tables:
    table_name = table[0]

    if table_name in SKIP_TABLES:
        print(f"Skipping table: {table_name}")
        continue

    print(f"Transferring table: {table_name}")

    # Fetch rows and column names
    sqlite_cur.execute(f"SELECT * FROM {table_name};")
    rows = sqlite_cur.fetchall()

    cols = [desc[0] for desc in sqlite_cur.description]
    col_str = ", ".join(cols)
    placeholders = ", ".join(["%s"] * len(cols))

    # Clean existing rows
    pg_cur.execute(f"DELETE FROM {table_name};")

    # Convert boolean-like fields
    converted_rows = [convert_boolean_values(cols, r) for r in rows]

    if rows:
        execute_batch(
            pg_cur,
            f"INSERT INTO {table_name} ({col_str}) VALUES ({placeholders})",
            converted_rows
        )

pg_conn.commit()

print("Data transfer complete!")
sqlite_conn.close()
pg_conn.close()
