import csv
import io
import json
import os
import sqlite3
from datetime import datetime
from pathlib import Path

from fastapi import (
    APIRouter, Depends, File, Header, HTTPException, Query, Request, UploadFile,
)
from fastapi.responses import StreamingResponse
from pydantic import ValidationError
from sqlalchemy import column, select, table, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.modulos.datos.schemas import (
    COLUMNAS_CSV_PACIENTE,
    ErrorFila,
    PacienteCSV,
    ResultadoImportacion,
)

router = APIRouter(prefix="/datos", tags=["Datos (importar / exportar)"])

RAIZ = Path(__file__).resolve().parents[3]          # raíz del proyecto
RUTA_SQLITE = Path(
    os.getenv("SQLITE_PATH", RAIZ / "exports" / "hospital_migrado.db")
)
MAX_BYTES = 5 * 1024 * 1024                         # 5 MB por archivo
MAX_ERRORES_REPORTADOS = 50

# --- SQL de SQLite (los nombres de columna vienen del schema, no del usuario) ---
SQL_CREAR_PACIENTE = """
CREATE TABLE IF NOT EXISTS paciente (
    expediente               TEXT NOT NULL PRIMARY KEY,
    nombre                   TEXT NOT NULL,
    fecha_nacimiento         TEXT NOT NULL,
    sexo                     TEXT NOT NULL CHECK (sexo IN ('M', 'F', 'OTRO')),
    tipo_paciente            TEXT NOT NULL,
    alergias                 TEXT,
    antecedentes_familiares  TEXT,
    antecedentes_personales  TEXT
)
"""
_COLS = ", ".join(COLUMNAS_CSV_PACIENTE)
_MARCAS = ", ".join(f":{c}" for c in COLUMNAS_CSV_PACIENTE)
_ACTUALIZAR = ", ".join(
    f"{c} = excluded.{c}" for c in COLUMNAS_CSV_PACIENTE if c != "expediente"
)
SQL_UPSERT_PACIENTE = (
    f"INSERT INTO paciente ({_COLS}) VALUES ({_MARCAS}) "
    f"ON CONFLICT(expediente) DO UPDATE SET {_ACTUALIZAR}"
)


# ---------------------------------------------------------------------------
# Autorización: solo un profesional ADMIN activo (header X-Profesional-Id)
# ---------------------------------------------------------------------------
def requerir_admin(
    x_profesional_id: int | None = Header(default=None),
    db: Session = Depends(get_db),
) -> int:
    if x_profesional_id is None:
        raise HTTPException(status_code=401, detail="Falta el header X-Profesional-Id.")

    fila = db.execute(
        text("SELECT rol, activo FROM profesional_salud WHERE id_profesional = :id"),
        {"id": x_profesional_id},
    ).first()

    if fila is None or not fila.activo or fila.rol != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Solo un profesional ADMIN activo puede usar este recurso.",
        )
    return x_profesional_id


# ---------------------------------------------------------------------------
# GET /datos/exportar/paciente
# ---------------------------------------------------------------------------
def _generar_csv(columnas, filas):
    """Genera el CSV por partes. Incluye BOM para que Excel respete los acentos."""
    buffer = io.StringIO()
    escritor = csv.writer(buffer)

    yield "\ufeff"
    escritor.writerow(columnas)
    yield buffer.getvalue()
    for fila in filas:
        buffer.seek(0)
        buffer.truncate(0)
        escritor.writerow(["" if v is None else v for v in fila])
        yield buffer.getvalue()


@router.get("/exportar/paciente")
def exportar_paciente(
    request: Request,
    id_profesional: int = Depends(requerir_admin),
    db: Session = Depends(get_db),
):
    consulta = (
        select(*[column(c) for c in COLUMNAS_CSV_PACIENTE])
        .select_from(table("paciente"))
        .order_by(column("expediente"))
    )
    filas = db.execute(consulta).all()
    nombre_archivo = f"pacientes_{datetime.now():%Y%m%d_%H%M%S}.csv"

    # Auditoría: si este INSERT falla, no se entrega el archivo.
    # id_registro = 0 -> operación masiva (toda la tabla), sin un registro único.
    db.execute(
        text(
            """
            INSERT INTO auditoria
                (id_profesional, tabla_afectada, accion, id_registro,
                 valor_anterior, valor_nuevo, fecha_hora, ip_origen)
            VALUES
                (:id_profesional, 'paciente', 'READ', 0,
                 NULL, CAST(:detalle AS jsonb), NOW(), :ip)
            """
        ),
        {
            "id_profesional": id_profesional,
            "detalle": json.dumps(
                {
                    "operacion": "exportar_csv",
                    "alcance": "tabla completa (id_registro=0)",
                    "archivo": nombre_archivo,
                    "filas": len(filas),
                }
            ),
            "ip": request.client.host if request.client else None,
        },
    )
    db.commit()

    return StreamingResponse(
        _generar_csv(COLUMNAS_CSV_PACIENTE, filas),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{nombre_archivo}"'},
    )


# ---------------------------------------------------------------------------
# POST /datos/importar/paciente  (destino: SQLite)
# ---------------------------------------------------------------------------
@router.post("/importar/paciente", response_model=ResultadoImportacion)
def importar_paciente(
    archivo: UploadFile = File(...),
    estricto: bool = Query(
        False, description="Si es true y hay filas inválidas, no se importa nada."
    ),
    _admin: int = Depends(requerir_admin),
):
    nombre = Path(archivo.filename or "").name
    if not nombre.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="El archivo debe ser un .csv.")

    contenido = archivo.file.read(MAX_BYTES + 1)
    if len(contenido) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="El archivo supera los 5 MB.")

    try:
        texto = contenido.decode("utf-8-sig")        # acepta con y sin BOM
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="El archivo debe estar en UTF-8.")

    lector = csv.DictReader(io.StringIO(texto, newline=""))
    encabezado = lector.fieldnames or []
    faltantes = [c for c in COLUMNAS_CSV_PACIENTE if c not in encabezado]
    sobrantes = [c for c in encabezado if c not in COLUMNAS_CSV_PACIENTE]
    if faltantes or sobrantes:
        raise HTTPException(
            status_code=400,
            detail=f"Encabezado inválido. Faltan: {faltantes}. Sobran: {sobrantes}.",
        )

    validas: list[dict] = []
    errores: list[ErrorFila] = []
    vistos: set[str] = set()
    leidas = 0

    for fila in lector:
        leidas += 1
        linea = lector.line_num

        if None in fila:                              # más valores que columnas
            errores.append(ErrorFila(fila=linea, detalle="Tiene más columnas que el encabezado."))
            continue
        try:
            registro = PacienteCSV.model_validate(fila)
        except ValidationError as e:
            detalle = "; ".join(
                f"{'.'.join(str(p) for p in err['loc'])}: {err['msg']}"
                for err in e.errors()
            )
            errores.append(ErrorFila(fila=linea, detalle=detalle))
            continue

        if registro.expediente in vistos:
            errores.append(ErrorFila(fila=linea, detalle="expediente duplicado en el archivo"))
            continue
        vistos.add(registro.expediente)

        datos = registro.model_dump()
        datos["fecha_nacimiento"] = datos["fecha_nacimiento"].isoformat()
        validas.append(datos)

    if estricto and errores:
        raise HTTPException(
            status_code=422,
            detail={
                "mensaje": "Hay filas inválidas; no se importó nada (modo estricto).",
                "errores": [e.model_dump() for e in errores[:MAX_ERRORES_REPORTADOS]],
            },
        )

    RUTA_SQLITE.parent.mkdir(parents=True, exist_ok=True)
    conexion = sqlite3.connect(RUTA_SQLITE)
    try:
        with conexion:                                # commit o rollback automático
            conexion.execute(SQL_CREAR_PACIENTE)
            conexion.executemany(SQL_UPSERT_PACIENTE, validas)
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="No se pudo escribir en SQLite.")
    finally:
        conexion.close()

    return ResultadoImportacion(
        archivo=nombre,
        destino=f"SQLite: {RUTA_SQLITE.name}",
        filas_leidas=leidas,
        filas_importadas=len(validas),
        filas_rechazadas=len(errores),
        errores=errores[:MAX_ERRORES_REPORTADOS],
    )