
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re

class DiagnosticoBase(BaseModel):
    codigo_cie10: str
    nombre_diagnostico: str
    categoria: str

    @field_validator('codigo_cie10')
    @classmethod
    def validar_formato_cie10(cls, v):
        # Patrón: 1 letra mayúscula, 2 números, opcional punto y hasta 4 caracteres
        patron = r'^[A-Z][0-9]{2}(\.[0-9A-Z]{1,4})?$'
        if not re.match(patron, v):
            raise ValueError('El código CIE-10 debe tener un formato válido (ej. F32.9 o F32)')
        return v

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
    tipo_nota: str
    contenido: str = Field(..., min_length=10, description="El contenido debe tener al menos 10 caracteres")
    gravedad_evento: Optional[str] = None

class NotaClinicaCreate(NotaClinicaBase):
    pass # El id_profesional se toma del header, no del body

class NotaClinicaResponse(NotaClinicaBase):
    id_nota: int
    id_profesional: int
    fecha_hora: datetime
    class Config:
        from_attributes = True