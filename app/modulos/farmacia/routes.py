from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from . import models, schemas

router = APIRouter()

# ─────────────── ENDPOINTS DE MEDICAMENTOS ───────────────
@router.get("/", response_model=List[schemas.MedicamentoResponse])
def listar_medicamentos(db: Session = Depends(get_db)):
    return db.query(models.Medicamento).all()

@router.post("/", response_model=schemas.MedicamentoResponse)
def crear_medicamento(med: schemas.MedicamentoCreate, db: Session = Depends(get_db)):
    nuevo = models.Medicamento(**med.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

# ─────────────── ENDPOINTS DE PRESCRIPCIONES (TU REGLA) ───────────────
@router.post("/prescribir/")
def crear_prescripcion(prescripcion: schemas.PrescripcionCreate, db: Session = Depends(get_db)):
    
    # 1. Contar cuántos medicamentos activos tiene el ingreso
    activos = db.query(models.Prescripcion).filter(
        models.Prescripcion.id_ingreso == prescripcion.id_ingreso,
        models.Prescripcion.activo == True
    ).count()

    # 2. Aplicar la regla de negocio (Polifarmacia)
    if activos >= 2:
        if not prescripcion.justificacion_exceso or not prescripcion.autorizado_por:
            raise HTTPException(
                status_code=400, 
                detail="LÍMITE EXCEDIDO: El paciente ya tiene 2 medicamentos activos. Se requiere justificación y autorización médica para agregar un tercero."
            )

    # 3. Si pasa la regla, se guarda
    nueva = models.Prescripcion(**prescripcion.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    
    return {"mensaje": "Prescripción creada exitosamente", "id": nueva.id_prescripcion}