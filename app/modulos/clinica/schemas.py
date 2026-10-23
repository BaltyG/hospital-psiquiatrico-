from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DiagnosticoBase(BaseModel):
    codigo_cie10: str
    nombre_diagnostico: str
    categoria: str

class DiagnosticoCreate(DiagnosticoBase):
    pass

class DiagnosticoResponse(DiagnosticoBase):
    id_diagnostico: int
    class Config:
        from_attributes = True

class DiagnosticoPacienteBase(BaseModel):
    id_ingreso: int
    id_diagnostico: int
    id_psiquiatra: int
    tipo: str

class DiagnosticoPacienteCreate(DiagnosticoPacienteBase):
    pass

class DiagnosticoPacienteResponse(DiagnosticoPacienteBase):
    fecha_diagnostico: datetime
    class Config:
        from_attributes = True

class NotaClinicaBase(BaseModel):
    id_ingreso: int
    id_profesional: int
    tipo_nota: str
    contenido: str
    gravedad_evento: Optional[str] = None

class NotaClinicaCreate(NotaClinicaBase):
    pass

class NotaClinicaResponse(NotaClinicaBase):
    id_nota: int
    fecha_hora: datetime
    class Config:
        from_attributes = True