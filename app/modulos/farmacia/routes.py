from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from . import models, schemas

router = APIRouter()

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