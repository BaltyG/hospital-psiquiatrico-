from fastapi import APIRouter, Depends, status, Query, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from app.database import get_db
from . import models, schemas

router = APIRouter()

def verificar_rol_auditor(db: Session, x_profesional_id: Optional[int]):
    if x_profesional_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta el encabezado de autenticación X-Profesional-Id."
        )

    prof = db.execute(
        text("""
            SELECT id_profesional, rol 
            FROM profesional_salud 
            WHERE id_profesional = :id AND activo = TRUE
        """),
        {"id": x_profesional_id}
    ).mappings().first()

    if not prof:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Profesional no encontrado o inactivo."
        )

    if str(prof["rol"]).upper() not in ("AUDITOR", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: solo personal con rol AUDITOR o ADMIN puede consultar la auditoría."
        )

@router.post("/", response_model=schemas.AuditoriaResponse, status_code=status.HTTP_201_CREATED)
def crear_registro_auditoria(registro: schemas.AuditoriaCreate, db: Session = Depends(get_db)):
    nuevo_registro = models.Auditoria(**registro.model_dump())
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)
    return nuevo_registro

@router.get("/", response_model=List[schemas.AuditoriaResponse])
def listar_auditoria(
    db: Session = Depends(get_db),
    tabla_afectada: Optional[str] = Query(None),
    accion: Optional[str] = Query(None),
    id_profesional: Optional[int] = Query(None),
    x_profesional_id: Optional[int] = Header(default=None, alias="X-Profesional-Id")
):
    verificar_rol_auditor(db, x_profesional_id)

    condiciones = []
    params = {}

    if tabla_afectada:
        condiciones.append("a.tabla_afectada = :tabla_afectada")
        params["tabla_afectada"] = tabla_afectada
    if accion:
        condiciones.append("UPPER(a.accion) = :accion")
        params["accion"] = accion.upper()
    if id_profesional:
        condiciones.append("a.id_profesional = :id_profesional")
        params["id_profesional"] = id_profesional

    where_clause = f"WHERE {' AND '.join(condiciones)}" if condiciones else ""

    query = text(f"""
        SELECT 
            a.id_auditoria,
            a.id_profesional,
            COALESCE(p.nombre_completo, 'Profesional #' || a.id_profesional) AS nombre_completo,
            a.tabla_afectada,
            a.accion,
            a.id_registro,
            a.valor_anterior,
            a.valor_nuevo,
            a.fecha_hora,
            a.ip_origen
        FROM auditoria a
        LEFT JOIN profesional_salud p ON a.id_profesional = p.id_profesional
        {where_clause}
        ORDER BY a.fecha_hora DESC
        LIMIT 50
    """)

    filas = db.execute(query, params).mappings().all()
    return [dict(fila) for fila in filas]

@router.get("/{id_auditoria}", response_model=schemas.AuditoriaDetalleResponse)
def obtener_detalle_auditoria(
    id_auditoria: int,
    db: Session = Depends(get_db),
    x_profesional_id: Optional[int] = Header(default=None, alias="X-Profesional-Id")
):
    verificar_rol_auditor(db, x_profesional_id)

    query = text("""
        SELECT
            a.id_auditoria,
            a.id_profesional,
            COALESCE(ps.nombre_completo, 'Profesional #' || a.id_profesional) AS nombre_completo,
            a.tabla_afectada,
            a.accion,
            a.id_registro,
            a.valor_anterior,
            a.valor_nuevo,
            a.fecha_hora,
            a.ip_origen
        FROM auditoria a
        LEFT JOIN profesional_salud ps
            ON a.id_profesional = ps.id_profesional
        WHERE a.id_auditoria = :id_auditoria
    """)

    fila = db.execute(query, {"id_auditoria": id_auditoria}).mappings().first()

    if not fila:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registro de auditoría #{id_auditoria} no encontrado."
        )

    return {
        "id_auditoria": fila["id_auditoria"],
        "id_profesional": fila["id_profesional"],
        "nombre_completo": fila["nombre_completo"],
        "tabla_afectada": fila["tabla_afectada"],
        "accion": fila["accion"],
        "id_registro": fila["id_registro"],
        "valor_anterior": fila["valor_anterior"],
        "valor_nuevo": fila["valor_nuevo"],
        "fecha_hora": fila["fecha_hora"],
        "ip_origen": fila["ip_origen"],
        "paciente": None,
        "diagnosticos": [],
        "notas_clinicas": [],
    }

    