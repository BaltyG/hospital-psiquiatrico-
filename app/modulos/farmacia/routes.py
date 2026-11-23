from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from app.database import get_db
from . import models, schemas

router = APIRouter()

# ─────────────── ENDPOINTS DE CATÁLOGO Y APOYO ───────────────
@router.get("/", response_model=List[schemas.MedicamentoResponse])
def listar_medicamentos(db: Session = Depends(get_db)):
    return db.query(models.Medicamento).order_by(models.Medicamento.id_medicamento.asc()).all()

@router.post("/", response_model=schemas.MedicamentoResponse)
def crear_medicamento(med: schemas.MedicamentoCreate, db: Session = Depends(get_db)):
    nuevo = models.Medicamento(**med.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.get("/ingresos-activos/")
def listar_ingresos_activos(db: Session = Depends(get_db)):
    query = text("""
        SELECT 
            i.id_ingreso,
            p.expediente,
            p.nombre AS nombre_paciente
        FROM ingreso i
        INNER JOIN paciente p ON i.expediente = p.expediente
        WHERE i.fecha_egreso IS NULL
        ORDER BY i.id_ingreso ASC
    """)
    filas = db.execute(query).mappings().all()
    return [dict(fila) for fila in filas]

@router.get("/psiquiatras/")
def listar_psiquiatras(db: Session = Depends(get_db)):
    query = text("""
        SELECT 
            id_profesional,
            nombre_completo
        FROM profesional_salud
        WHERE UPPER(rol) = 'PSIQUIATRA' AND activo = TRUE
        ORDER BY id_profesional ASC
    """)
    filas = db.execute(query).mappings().all()
    return [dict(fila) for fila in filas]

@router.get("/prescripciones/{id_ingreso}")
def listar_prescripciones_activas(id_ingreso: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT 
            pr.id_prescripcion,
            pr.dosis_cantidad,
            pr.dosis_unidad,
            pr.frecuencia_horas,
            pr.via_administracion,
            m.id_medicamento,
            m.nombre_generico,
            m.presentacion,
            m.grupo_farmacologico
        FROM prescripcion pr
        INNER JOIN medicamento m ON pr.id_medicamento = m.id_medicamento
        WHERE pr.id_ingreso = :id_ingreso AND pr.activo = TRUE
        ORDER BY pr.id_prescripcion ASC
    """)
    filas = db.execute(query, {"id_ingreso": id_ingreso}).mappings().all()
    lista = [dict(fila) for fila in filas]
    return {
        "id_ingreso": id_ingreso,
        "total_activos": len(lista),
        "limite": 2,
        "prescripciones": lista
    }

# ─────────────── ENDPOINTS DE PRESCRIPCIONES ───────────────
@router.post("/prescribir/")
def crear_prescripcion(
    prescripcion: schemas.PrescripcionCreate,
    db: Session = Depends(get_db),
    x_profesional_id: Optional[int] = Header(default=None, alias="X-Profesional-Id")
):
    # 1. Validar profesional activo y rol si viene el header X-Profesional-Id
    id_psiquiatra_final = prescripcion.id_psiquiatra
    if x_profesional_id is not None:
        prof = db.execute(
            text("""
                SELECT id_profesional, rol 
                FROM profesional_salud 
                WHERE id_profesional = :id AND activo = TRUE
            """),
            {"id": x_profesional_id}
        ).mappings().first()

        if not prof:
            raise HTTPException(status_code=401, detail="Profesional no encontrado o inactivo.")
        if str(prof["rol"]).upper() != "PSIQUIATRA":
            raise HTTPException(status_code=403, detail="Solo personal con rol PSIQUIATRA puede emitir prescripciones.")
        id_psiquiatra_final = prof["id_profesional"]

    if not id_psiquiatra_final:
        raise HTTPException(status_code=400, detail="No se identificó el psiquiatra prescriptor.")

    # 2. Verificar existencia y stock del medicamento
    medicamento = db.query(models.Medicamento).filter(
        models.Medicamento.id_medicamento == prescripcion.id_medicamento
    ).first()
    if not medicamento:
        raise HTTPException(status_code=404, detail="El medicamento seleccionado no existe.")
    if medicamento.stock_actual <= 0:
        raise HTTPException(status_code=400, detail="No hay stock disponible para este medicamento")

    # 3. Contar cuántos medicamentos activos tiene el ingreso
    activos = db.query(models.Prescripcion).filter(
        models.Prescripcion.id_ingreso == prescripcion.id_ingreso,
        models.Prescripcion.activo == True
    ).count()

    # 4. Aplicar la regla de negocio (Polifarmacia)
    if activos >= 2:
        if not prescripcion.justificacion_exceso or not prescripcion.justificacion_exceso.strip() or not prescripcion.autorizado_por:
            raise HTTPException(
                status_code=400,
                detail="LÍMITE EXCEDIDO: El paciente ya tiene 2 medicamentos activos. Se requiere justificación y autorización médica para agregar un tercero."
            )

    # 5. Guardar prescripción y descontar 1 unidad de stock
    datos_prescripcion = prescripcion.model_dump()
    datos_prescripcion["id_psiquiatra"] = id_psiquiatra_final

    nueva = models.Prescripcion(**datos_prescripcion)
    medicamento.stock_actual -= 1

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return {"mensaje": "Prescripción creada exitosamente", "id": nueva.id_prescripcion}