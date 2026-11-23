from pydantic import BaseModel
from datetime import date

class PacienteBase(BaseModel):
    expediente: str
    nombre: str
    fecha_nacimiento: date
    sexo: str
    tipo_paciente: str

class PacienteResponse(PacienteBase):
    class Config:
        from_attributes = True 

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IngresoCreate(BaseModel):
    expediente: str
    id_psiquiatra: int
    fecha_ingreso: datetime
    fecha_egreso: Optional[datetime] = None
    motivo_ingreso: str
    tipo_ingreso: str
    area: str
    cama: Optional[str] = None