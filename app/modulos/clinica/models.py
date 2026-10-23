from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Diagnostico(Base):
    __tablename__ = "diagnostico"
    id_diagnostico = Column(Integer, primary_key=True, index=True)
    codigo_cie10 = Column(String(20), unique=True, nullable=False, index=True)
    nombre_diagnostico = Column(String(200), nullable=False)
    categoria = Column(String(100), nullable=False)
    # Agregamos foreign_keys para que no se haga bolas
    pacientes_asociados = relationship("DiagnosticoPaciente", back_populates="diagnostico", foreign_keys="[DiagnosticoPaciente.id_diagnostico]")

class DiagnosticoPaciente(Base):
    __tablename__ = "diagnostico_paciente"
    # ¡Ojo aquí! Ahora sí van como ForeignKey
    id_ingreso = Column(Integer, primary_key=True, nullable=False, index=True)
    id_diagnostico = Column(Integer, ForeignKey("diagnostico.id_diagnostico"), primary_key=True, nullable=False, index=True)
    fecha_diagnostico = Column(DateTime, nullable=False, server_default=func.now())
    id_psiquiatra = Column(Integer, nullable=False)
    tipo = Column(String(50), nullable=False)
    
    diagnostico = relationship("Diagnostico", back_populates="pacientes_asociados")