from sqlalchemy import Column, Integer, String, Date
from app.database import Base

class Paciente(Base):
    __tablename__ = "paciente"

    expediente = Column(String(20), primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    sexo = Column(String(10), nullable=False)
    tipo_paciente = Column(String(50), nullable=False)
    alergias = Column(String, nullable=False)
    antecedentes_familiares = Column(String, nullable=False)
    antecedentes_personales = Column(String, nullable=False)

