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