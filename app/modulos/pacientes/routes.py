from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from . import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.PacienteResponse])
def listar_pacientes(db: Session = Depends(get_db)):
    """
    Endpoint para listar todos los pacientes registrados.
    """
    # Consultamos todos los pacientes en la base de datos
    pacientes = db.query(models.Paciente).all()
    return pacientes