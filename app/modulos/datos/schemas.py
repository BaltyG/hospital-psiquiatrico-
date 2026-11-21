from datetime import date

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Literal


class PacienteCSV(BaseModel):
    """Una fila válida del CSV de pacientes (mismas columnas que la tabla)."""

    model_config = ConfigDict(str_strip_whitespace=True)

    expediente: str = Field(min_length=1)
    nombre: str = Field(min_length=1)
    fecha_nacimiento: date
    sexo: Literal["M", "F", "OTRO"]
    tipo_paciente: str = Field(min_length=1)
    alergias: str | None = None
    antecedentes_familiares: str | None = None
    antecedentes_personales: str | None = None

    @field_validator(
        "alergias", "antecedentes_familiares", "antecedentes_personales",
        mode="before",
    )
    @classmethod
    def vacio_a_none(cls, v):
        # En el CSV, un campo opcional vacío significa NULL
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

    @field_validator("fecha_nacimiento")
    @classmethod
    def no_futura(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("la fecha de nacimiento no puede ser futura")
        return v


# Las columnas del CSV salen del propio schema: una sola fuente de verdad
COLUMNAS_CSV_PACIENTE: list[str] = list(PacienteCSV.model_fields)


class ErrorFila(BaseModel):
    fila: int                     # número de línea en el archivo (el encabezado es la 1)
    detalle: str


class ResultadoImportacion(BaseModel):
    archivo: str
    destino: str                  # p. ej. "SQLite: hospital_migrado.db"
    filas_leidas: int
    filas_importadas: int
    filas_rechazadas: int
    errores: list[ErrorFila] = []