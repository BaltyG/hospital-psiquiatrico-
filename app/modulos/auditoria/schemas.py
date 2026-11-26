from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any, List
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
    nombre_completo: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PacienteAuditoriaDetalle(BaseModel):
    expediente: int
    nombre_completo: Optional[str] = None
    curp: Optional[str] = None
    fecha_nacimiento: Optional[Any] = None
    sexo: Optional[str] = None
    id_ingreso: Optional[int] = None
    fecha_ingreso: Optional[Any] = None
    estado_ingreso: Optional[str] = None

class DiagnosticoAuditoriaItem(BaseModel):
    id_diagnostico: int
    codigo_cie10: str
    nombre_diagnostico: str
    categoria: str
    tipo: str
    fecha_diagnostico: Optional[Any] = None

class NotaAuditoriaItem(BaseModel):
    id_nota: int
    tipo_nota: str
    fecha_hora: Optional[Any] = None
    contenido: str
    gravedad_evento: Optional[str] = None
    autor_nota: Optional[str] = None

class AuditoriaDetalleResponse(AuditoriaResponse):
    paciente: Optional[PacienteAuditoriaDetalle] = None
    diagnosticos: List[DiagnosticoAuditoriaItem] = []
    notas_clinicas: List[NotaAuditoriaItem] = []

    # --- Schemas para Alertas ---
class AlertaResponse(BaseModel):
    id_alerta: int
    expediente: str
    id_ingreso: Optional[int] = None
    tipo_alerta: str
    severidad: str
    fecha_generacion: datetime
    estado: str
    descripcion: str
    revisado_por: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

class AlertaCambioEstado(BaseModel):
    estado: str = Field(..., description="Debe ser 'Revisada' o 'Descartada'")


class AuditoriaDetalleResponse(AuditoriaResponse):
    paciente: Optional[PacienteAuditoriaDetalle] = None
    diagnosticos: List[DiagnosticoAuditoriaItem] = []
    notas_clinicas: List[NotaAuditoriaItem] = []

# --- Schemas para Alertas (Asegúrate de que estén alineados a la izquierda) ---
class AlertaResponse(BaseModel):
    id_alerta: int
    expediente: str
    id_ingreso: Optional[int] = None
    tipo_alerta: str
    severidad: str
    fecha_generacion: datetime
    estado: str
    descripcion: str
    revisado_por: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

class AlertaCambioEstado(BaseModel):
    estado: str = Field(..., description="Debe ser 'Revisada' o 'Descartada'")

# Schema para el Dashboard  ---
class DashboardResumen(BaseModel):
    total_alertas_pendientes: int
    total_eventos_auditoria: int
    ultimas_alertas: List[AlertaResponse]
    ultimos_eventos: List[AuditoriaResponse]