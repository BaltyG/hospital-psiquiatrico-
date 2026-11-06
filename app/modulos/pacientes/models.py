from sqlalchemy import Column, String, Date
from app.database import Base

class Paciente(Base):
    __tablename__ = "paciente" # Ojo: nombre exacto de la tabla en PostgreSQL

    expediente = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    sexo = Column(String, nullable=False)
    tipo_paciente = Column(String, nullable=False)
    # No incluimos los demás campos (alergias, etc.) porque el endpoint solo pide estos.