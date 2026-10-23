from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any
from datetime import datetime

class AuditoriaBase(BaseModel):
    id_profesional: int = Field(..., description="ID del profesional que realizó la acción")
    tabla_afectada: str = Field(..., max_length=100)
    accion: str = Field(..., max_length=50)
    id_registro: int
    valor_anterior: Optional[Dict[str, Any]] = None
    valor_nuevo: Optional[Dict[str, Any]] = None
    ip_origen: str = Field(..., max_length=45)

class AuditoriaCreate(AuditoriaBase):
    pass

class AuditoriaResponse(AuditoriaBase):
    id_auditoria: int
    fecha_hora: datetime
    model_config = ConfigDict(from_attributes=True)