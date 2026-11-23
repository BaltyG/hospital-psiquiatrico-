from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from . import models, schemas
from fastapi import HTTPException

router = APIRouter()

@router.get("/", response_model=List[schemas.PacienteResponse])
def listar_pacientes(db: Session = Depends(get_db)):
    """
    Endpoint para listar todos los pacientes registrados.
    """
    pacientes = db.query(models.Paciente).all()
    return pacientes

from app.modulos.pacientes.schemas import IngresoCreate # Asegúrate de que esto esté arriba o aquí

@router.post("/ingresos/", tags=["Ingresos"])
def crear_ingreso(
    ingreso: IngresoCreate, 
    db: Session = Depends(get_db)
):
    # --- TAREA 3: VALIDACIONES ---
    
    query_activo = text("SELECT id_ingreso FROM ingreso WHERE expediente = :exp AND fecha_egreso IS NULL")
    ingreso_activo = db.execute(query_activo, {"exp": ingreso.expediente}).fetchone()
    
    if ingreso_activo:
        raise HTTPException(
            status_code=409, 
            detail="El paciente ya tiene un ingreso activo. Debe registrar el alta antes de crear uno nuevo."
        )

    if ingreso.fecha_egreso and ingreso.fecha_egreso < ingreso.fecha_ingreso:
        raise HTTPException(
            status_code=400, 
            detail="La fecha de egreso no puede ser anterior a la fecha de ingreso."
        )

    query_insert = text("""
        INSERT INTO ingreso (expediente, id_psiquiatra, fecha_ingreso, fecha_egreso, motivo_ingreso, tipo_ingreso, area, cama)
        VALUES (:exp, :psi, :f_ing, :f_egr, :motivo, :tipo, :area, :cama)
        RETURNING id_ingreso
    """)
    
    nuevo_id = db.execute(query_insert, {
        "exp": ingreso.expediente,
        "psi": ingreso.id_psiquiatra,
        "f_ing": ingreso.fecha_ingreso,
        "f_egr": ingreso.fecha_egreso,
        "motivo": ingreso.motivo_ingreso,
        "tipo": ingreso.tipo_ingreso,
        "area": ingreso.area,
        "cama": ingreso.cama
    }).fetchone()[0]
    
    db.commit()

    return {"mensaje": "Ingreso creado con éxito", "id_ingreso": nuevo_id}