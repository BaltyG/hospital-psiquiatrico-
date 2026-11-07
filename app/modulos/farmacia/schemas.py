from pydantic import BaseModel
from typing import Optional
from datetime import date

class MedicamentoBase(BaseModel):
    nombre_generico: str
    nombre_comercial: Optional[str] = None
    grupo_farmacologico: str
    presentacion: str
    stock_actual: int = 0

class MedicamentoCreate(MedicamentoBase):
    pass

class MedicamentoResponse(MedicamentoBase):
    id_medicamento: int
    class Config:
        from_attributes = True

class PrescripcionCreate(BaseModel):
    id_ingreso: int
    id_medicamento: int
    id_psiquiatra: int
    dosis_cantidad: float
    dosis_unidad: str
    frecuencia_horas: int
    via_administracion: str
    fecha_inicio: date
    justificacion_exceso: Optional[str] = None
    autorizado_por: Optional[int] = None