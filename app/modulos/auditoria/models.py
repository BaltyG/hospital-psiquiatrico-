from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.database import Base

class Auditoria(Base):
    __tablename__ = "auditoria"

    id_auditoria = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_profesional = Column(Integer, nullable=False, index=True)
    tabla_afectada = Column(String(100), nullable=False, index=True)
    accion = Column(String(50), nullable=False, index=True)
    id_registro = Column(Integer, nullable=False)
    valor_anterior = Column(JSONB, nullable=True)
    valor_nuevo = Column(JSONB, nullable=True)
    fecha_hora = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    ip_origen = Column(String(45), nullable=False)