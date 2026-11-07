from sqlalchemy import DECIMAL, Boolean, Column, Date, Integer, String
from app.database import Base

class Medicamento(Base):
    __tablename__ = "medicamento"
    id_medicamento = Column(Integer, primary_key=True, index=True)
    nombre_generico = Column(String(150), nullable=False)
    nombre_comercial = Column(String(150))
    grupo_farmacologico = Column(String(100), nullable=False)
    presentacion = Column(String(100), nullable=False)
    stock_actual = Column(Integer, nullable=False, default=0)

class Prescripcion(Base):
    __tablename__ = "prescripcion"
    id_prescripcion = Column(Integer, primary_key=True, index=True)
    id_ingreso = Column(Integer, nullable=False)
    id_medicamento = Column(Integer, nullable=False)
    id_psiquiatra = Column(Integer, nullable=False)
    dosis_cantidad = Column(DECIMAL(10,2), nullable=False)
    dosis_unidad = Column(String(20), nullable=False)
    frecuencia_horas = Column(Integer, nullable=False)
    via_administracion = Column(String(30), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date)
    activo = Column(Boolean, default=True)
    justificacion_exceso = Column(String)
    autorizado_por = Column(Integer)
    motivo_suspension = Column(String)