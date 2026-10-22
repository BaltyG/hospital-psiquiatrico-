from sqlalchemy import Column, Integer, String
from app.database import Base

class Medicamento(Base):
    __tablename__ = "medicamento"
    id_medicamento = Column(Integer, primary_key=True, index=True)
    nombre_generico = Column(String(150), nullable=False)
    nombre_comercial = Column(String(150))
    grupo_farmacologico = Column(String(100), nullable=False)
    presentacion = Column(String(100), nullable=False)
    stock_actual = Column(Integer, nullable=False, default=0)