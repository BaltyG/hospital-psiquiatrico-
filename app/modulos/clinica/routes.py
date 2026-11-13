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
    # 1. Validar que no se asigne el mismo diagnóstico al mismo ingreso (evitar duplicados)
    existe_asignacion = db.query(models.DiagnosticoPaciente).filter(
        models.DiagnosticoPaciente.id_ingreso == diag_pac.id_ingreso,
        models.DiagnosticoPaciente.id_diagnostico == diag_pac.id_diagnostico
    ).first()

    if existe_asignacion:
        raise HTTPException(status_code=400, detail="Este diagnóstico ya está asignado a este ingreso.")

    # 2. Validar que el diagnóstico exista en el catálogo CIE-10
    diagnostico_existe = db.query(models.Diagnostico).filter(
        models.Diagnostico.id_diagnostico == diag_pac.id_diagnostico
    ).first()

    if not diagnostico_existe:
        raise HTTPException(status_code=404, detail="El diagnóstico especificado no existe en el catálogo CIE-10.")

    # 3. Si todo está bien, guardamos el registro
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

# RUTA GET
@router.get("/pacientes/{id_ingreso}/diagnosticos/", response_model=List[schemas.DiagnosticoPacienteResponse], tags=["Diagnósticos de Pacientes"])
def obtener_diagnosticos_de_paciente(id_ingreso: int, db: Session = Depends(get_db)):
    # Buscamos en la base de datos todos los diagnósticos que tengan este id_ingreso
    diagnosticos = db.query(models.DiagnosticoPaciente).filter(
        models.DiagnosticoPaciente.id_ingreso == id_ingreso
    ).all()
    
    return diagnosticos