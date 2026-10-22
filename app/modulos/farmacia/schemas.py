from pydantic import BaseModel
from typing import Optional

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