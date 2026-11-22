from sqlalchemy.sql import text
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from . import models, schemas
from .dependencies import requerir_rol_clinica 


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
def crear_nota_clinica(
    nota: schemas.NotaClinicaCreate, 
    db: Session = Depends(get_db),
    usuario_actual = Depends(requerir_rol_clinica("PSIQUIATRA", "ENFERMERA")) # <-- Solo estos dos roles
):
    # 1. Validar que el ingreso exista
    query_ingreso = text("SELECT fecha_egreso FROM ingreso WHERE id_ingreso = :id")
    ingreso = db.execute(query_ingreso, {"id": nota.id_ingreso}).fetchone()
    if not ingreso:
        raise HTTPException(status_code=404, detail="El ingreso especificado no existe.")
    
    # 2. Validar que el ingreso esté activo (sin fecha de egreso)
    if ingreso[0] is not None:
        raise HTTPException(status_code=409, detail="No se puede escribir una nota en un ingreso cerrado.")

    # 3. Crear la nota (el id_profesional sale del header, NUNCA del body)
    nueva_nota = models.NotaClinica(
        id_ingreso=nota.id_ingreso,
        id_profesional=usuario_actual.id_profesional, 
        tipo_nota=nota.tipo_nota,
        contenido=nota.contenido,
        gravedad_evento=nota.gravedad_evento
    )
    db.add(nueva_nota)
    db.commit()
    db.refresh(nueva_nota)
    
    return nueva_nota

@router.get("/notas/ingreso/{id_ingreso}", response_model=List[schemas.NotaClinicaResponse], tags=["Notas Clínicas"])
def obtener_notas_por_ingreso(
    id_ingreso: int, 
    db: Session = Depends(get_db),
    usuario_actual = Depends(requerir_rol_clinica("PSIQUIATRA", "ENFERMERA")) # <-- El auditor recibe 403 automáticamente
):
    # Validar que el ingreso exista
    ingreso = db.query(Ingreso).filter(Ingreso.id_ingreso == id_ingreso).first()
    if not ingreso:
        raise HTTPException(status_code=404, detail="El ingreso especificado no existe.")

    # Traer notas ordenadas de la más reciente a la más antigua
    notas = db.query(models.NotaClinica).filter(
        models.NotaClinica.id_ingreso == id_ingreso
    ).order_by(models.NotaClinica.fecha_hora.desc()).all()
    
    return notas