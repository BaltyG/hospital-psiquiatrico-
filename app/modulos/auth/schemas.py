from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints

Username = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)
]


class LoginRequest(BaseModel):
    username: Username
    password: str = Field(min_length=1, max_length=128)  # no se recorta: los espacios cuentan


class LoginResponse(BaseModel):
    id_profesional: int
    username: str
    nombre_completo: str
    rol: str