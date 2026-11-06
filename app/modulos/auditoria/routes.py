import traceback # <-- Agrega esto arriba del todo
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from . import models, schemas

router = APIRouter()

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
    id_profesional: Optional[int] = Query(None)
):
    query = db.query(models.Auditoria)
    if tabla_afectada:
        query = query.filter(models.Auditoria.tabla_afectada == tabla_afectada)
    if accion:
        query = query.filter(models.Auditoria.accion == accion.upper())
    if id_profesional:
        query = query.filter(models.Auditoria.id_profesional == id_profesional)
    return query.order_by(models.Auditoria.fecha_hora.desc()).all()