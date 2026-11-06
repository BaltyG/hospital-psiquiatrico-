from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from . import models

router = APIRouter()

@router.get("/")
def listar_pacientes(db: Session = Depends(get_db)):
    # Consulta todos los pacientes en la base de datos
    pacientes = db.query(models.Paciente).all()
    return pacientes
