from fastapi import APIRouter, Depends, status, Query, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from app.database import get_db
from . import models, schemas
from app.modulos.auditoria.schemas import AlertaResponse, AlertaCambioEstado, DashboardResumen
from app.modulos.auditoria.models import Alerta
from fastapi import HTTPException


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

# --- Función auxiliar para validar roles de alertas ---
def verificar_rol_alerta(db: Session, x_profesional_id: Optional[int]):
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

    # Aquí permitimos a AUDITOR, ADMIN y PSIQUIATRA
    if str(prof["rol"]).upper() not in ("AUDITOR", "ADMIN", "PSIQUIATRA"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: solo personal autorizado puede gestionar alertas."
        )
    return x_profesional_id


# 1. Listar Alertas
@router.get("/alertas/", response_model=List[AlertaResponse])
def listar_alertas(
    db: Session = Depends(get_db),
    estado: Optional[str] = Query(None, description="Filtrar por estado (Pendiente, Revisada, Descartada)"),
    severidad: Optional[str] = Query(None, description="Filtrar por severidad (Alta, Media, Baja)"),
    x_profesional_id: Optional[int] = Header(default=None, alias="X-Profesional-Id")
):
    # Usamos la validación manual que ya tienes en tu archivo
    verificar_rol_alerta(db, x_profesional_id)

    query = db.query(Alerta)
    
    if estado:
        query = query.filter(Alerta.estado == estado)
    if severidad:
        query = query.filter(Alerta.severidad == severidad)
        
    # Ordenar por las más recientes
    alertas = query.order_by(Alerta.fecha_generacion.desc()).all()
    return alertas


# 2. Cambiar Estado de una Alerta (Revisar / Descartar)
@router.patch("/alertas/{id_alerta}", response_model=AlertaResponse)
def cambiar_estado_alerta(
    id_alerta: int,
    datos: AlertaCambioEstado,
    db: Session = Depends(get_db),
    x_profesional_id: Optional[int] = Header(default=None, alias="X-Profesional-Id")
):
    # Validamos el rol
    id_profesional_actual = verificar_rol_alerta(db, x_profesional_id)

    # Validar que el estado sea correcto
    if datos.estado not in ("Revisada", "Descartada"):
        raise HTTPException(status_code=400, detail="El estado solo puede ser 'Revisada' o 'Descartada'")

    alerta = db.query(Alerta).filter(Alerta.id_alerta == id_alerta).first()
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    # Actualizar datos
    alerta.estado = datos.estado
    alerta.revisado_por = id_profesional_actual 
    
    db.commit()
    db.refresh(alerta)
    
    return alerta

# --- Endpoint del Dashboard ---
@router.get("/dashboard/resumen", response_model=DashboardResumen)
def obtener_resumen_dashboard(
    db: Session = Depends(get_db),
    x_profesional_id: Optional[int] = Header(default=None, alias="X-Profesional-Id")
):
    # Validamos que sea AUDITOR o ADMIN
    verificar_rol_auditor(db, x_profesional_id)

    # 1. Conteos
    total_alertas = db.query(Alerta).filter(Alerta.estado == 'Pendiente').count()
    total_eventos = db.query(models.Auditoria).count()

    # 2. Últimas 5 alertas
    ultimas_alertas = db.query(Alerta).order_by(Alerta.fecha_generacion.desc()).limit(5).all()

    # 3. Últimos 5 eventos de auditoría
    ultimos_eventos = db.query(models.Auditoria).order_by(models.Auditoria.fecha_hora.desc()).limit(5).all()

    return {
        "total_alertas_pendientes": total_alertas,
        "total_eventos_auditoria": total_eventos,
        "ultimas_alertas": ultimas_alertas,
        "ultimos_eventos": ultimos_eventos
    }

# --- ENDPOINT DE ADMINISTRACIÓN ---
@router.get("/admin/permisos")
def listar_permisos_bd(
    db: Session = Depends(get_db),
    x_profesional_id: Optional[int] = Header(default=None, alias="X-Profesional-Id")
):
    # Solo el ADMIN puede ver esto. Reutilizado de lógica pero validando solo ADMIN.
    if x_profesional_id is None:
        raise HTTPException(status_code=401, detail="Falta header")
        
    prof = db.execute(
        text("SELECT rol FROM profesional_salud WHERE id_profesional = :id AND activo = TRUE"),
        {"id": x_profesional_id}
    ).mappings().first()

    if not prof or prof["rol"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Acceso denegado: Solo ADMIN.")

    # Consulta avanzada a pg_catalog para ver permisos de tablas
    query = text("""
        SELECT 
            r.rolname AS rol,
            c.relname AS tabla,
            has_table_privilege(r.rolname, c.oid, 'SELECT') AS puede_select,
            has_table_privilege(r.rolname, c.oid, 'INSERT') AS puede_insert,
            has_table_privilege(r.rolname, c.oid, 'UPDATE') AS puede_update,
            has_table_privilege(r.rolname, c.oid, 'DELETE') AS puede_delete
        FROM pg_catalog.pg_roles r
        CROSS JOIN pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
          AND c.relkind = 'r' -- Solo tablas
          AND r.rolname NOT LIKE 'pg_%' -- Ignorar roles internos de Postgres
        ORDER BY r.rolname, c.relname;
    """)
    
    resultados = db.execute(query).mappings().all()
    return [dict(fila) for fila in resultados]

