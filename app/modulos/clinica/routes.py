from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from . import models, schemas

router = APIRouter()

@router.post("/diagnosticos/", response_model=schemas.DiagnosticoResponse, tags=["Diagnósticos"])
def crear_diagnostico(diag: schemas.DiagnosticoCreate, db: Session = Depends(get_db)):
    existe = db.query(models.Diagnostico).filter(models.Diagnostico.codigo_cie10 == diag.codigo_cie10).first()
    if existe:
        raise HTTPException(status_code=400, detail="El código CIE-10 ya está registrado.")
    nuevo_diag = models.Diagnostico(**diag.model_dump())
    db.add(nuevo_diag)
    db.commit()
    db.refresh(nuevo_diag)
    return nuevo_diag

@router.get("/diagnosticos/", response_model=List[schemas.DiagnosticoResponse], tags=["Diagnósticos"])
def listar_diagnosticos(db: Session = Depends(get_db)):
    return db.query(models.Diagnostico).all()

@router.post("/pacientes/diagnosticos/", response_model=schemas.DiagnosticoPacienteResponse, tags=["Diagnósticos de Pacientes"])
def asignar_diagnostico_a_paciente(diag_pac: schemas.DiagnosticoPacienteCreate, db: Session = Depends(get_db)):
    nuevo_registro = models.DiagnosticoPaciente(**diag_pac.model_dump())
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)
    return nuevo_registro

@router.post("/notas/", response_model=schemas.NotaClinicaResponse, tags=["Notas Clínicas"])
def crear_nota_clinica(nota: schemas.NotaClinicaCreate, db: Session = Depends(get_db)):
    nueva_nota = models.NotaClinica(**nota.model_dump())
    db.add(nueva_nota)
    db.commit()
    db.refresh(nueva_nota)
    return nueva_nota

@router.get("/notas/ingreso/{id_ingreso}", response_model=List[schemas.NotaClinicaResponse], tags=["Notas Clínicas"])
def obtener_notas_por_ingreso(id_ingreso: int, db: Session = Depends(get_db)):
    notas = db.query(models.NotaClinica).filter(models.NotaClinica.id_ingreso == id_ingreso).all()
    return notas
