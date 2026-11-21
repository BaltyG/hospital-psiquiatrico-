"""
Migra paciente y medicamento de PostgreSQL a SQLite, pasando por CSV.
Uso:  python scripts/migrar_a_sqlite.py
"""
import csv
import os
import sqlite3
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from psycopg2 import sql

load_dotenv()

TABLAS = ["paciente", "medicamento"]
CARPETA = Path("exports")
SQLITE_PATH = CARPETA / "hospital_migrado.db"

PG_CONFIG = dict(
    host=os.getenv("DB_HOST", "localhost"),
    port=os.getenv("DB_PORT", "5432"),
    dbname=os.getenv("DB_NAME", "hospital_psiquiatrico"),
    user=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD"),
)


def tipo_sqlite(tipo_pg: str) -> str:
    """Traduce el tipo de PostgreSQL al tipo (afinidad) de SQLite."""
    if tipo_pg in ("smallint", "integer", "bigint", "boolean"):
        return "INTEGER"
    if tipo_pg == "numeric":
        return "NUMERIC"
    if tipo_pg in ("real", "double precision"):
        return "REAL"
    return "TEXT"  # varchar, text, date, timestamp...


def leer_columnas(cur, tabla):
    cur.execute(
        """
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = %s
        ORDER BY ordinal_position
        """,
        (tabla,),
    )
    return cur.fetchall()


def leer_pk(cur, tabla):
    cur.execute(
        """
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON kcu.constraint_name = tc.constraint_name
         AND kcu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public' AND tc.table_name = %s
        ORDER BY kcu.ordinal_position
        """,
        (tabla,),
    )
    return [fila[0] for fila in cur.fetchall()]


def exportar_csv(cur, tabla) -> Path:
    ruta = CARPETA / f"{tabla}.csv"
    consulta = sql.SQL(
        "COPY (SELECT * FROM {}) TO STDOUT WITH (FORMAT csv, HEADER true)"
    ).format(sql.Identifier(tabla))
    with open(ruta, "w", encoding="utf-8", newline="") as f:
        cur.copy_expert(consulta.as_string(cur), f)
    return ruta


def crear_tabla_sqlite(lite, tabla, columnas, pk):
    defs = []
    for nombre, tipo, nullable in columnas:
        d = f'"{nombre}" {tipo_sqlite(tipo)}'
        if nullable == "NO":
            d += " NOT NULL"
        defs.append(d)
    if pk:
        defs.append("PRIMARY KEY (" + ", ".join(f'"{c}"' for c in pk) + ")")
    lite.execute(f'DROP TABLE IF EXISTS "{tabla}"')
    lite.execute(f'CREATE TABLE "{tabla}" ({", ".join(defs)})')


def cargar_csv(lite, tabla, ruta, columnas) -> int:
    tipos = {nombre: tipo for nombre, tipo, _ in columnas}
    with open(ruta, encoding="utf-8", newline="") as f:
        lector = csv.DictReader(f)
        nombres = lector.fieldnames
        filas = []
        for fila in lector:
            valores = []
            for n in nombres:
                v = fila[n]
                if v == "":
                    v = None                      # NULL
                elif tipos[n] == "boolean":
                    v = 1 if v == "t" else 0      # PostgreSQL exporta t/f
                valores.append(v)
            filas.append(valores)

    cols = ", ".join(f'"{n}"' for n in nombres)
    marcas = ", ".join("?" for _ in nombres)
    lite.executemany(
        f'INSERT INTO "{tabla}" ({cols}) VALUES ({marcas})', filas
    )
    return len(filas)


def main():
    CARPETA.mkdir(exist_ok=True)
    pg = psycopg2.connect(**PG_CONFIG)
    pg.set_client_encoding("UTF8")
    pg.set_session(readonly=True)          # solo lectura en PostgreSQL
    lite = sqlite3.connect(SQLITE_PATH)

    try:
        with pg.cursor() as cur:
            for tabla in TABLAS:
                columnas = leer_columnas(cur, tabla)
                if not columnas:
                    raise SystemExit(f"No se encontró la tabla '{tabla}'.")
                pk = leer_pk(cur, tabla)

                ruta = exportar_csv(cur, tabla)
                crear_tabla_sqlite(lite, tabla, columnas, pk)
                insertadas = cargar_csv(lite, tabla, ruta, columnas)

                cur.execute(
                    sql.SQL("SELECT COUNT(*) FROM {}").format(sql.Identifier(tabla))
                )
                total_pg = cur.fetchone()[0]
                total_lite = lite.execute(
                    f'SELECT COUNT(*) FROM "{tabla}"'
                ).fetchone()[0]

                estado = "OK" if total_pg == total_lite == insertadas else "REVISAR"
                print(f"[{estado}] {tabla}: PostgreSQL={total_pg} "
                      f"SQLite={total_lite} CSV={ruta}")
        lite.commit()
    finally:
        pg.close()
        lite.close()


if __name__ == "__main__":
    main()