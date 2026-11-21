import json
import time
from collections import deque

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.modulos.auth.schemas import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])

MENSAJE_CREDENCIALES = "Usuario o contraseña incorrectos."
MAX_INTENTOS = 5
VENTANA_SEG = 300

_fallos: dict[str, deque[float]] = {}
_HASH_RELLENO = bcrypt.hashpw(b"relleno-no-valido", bcrypt.gensalt()).decode()

def _bloqueado(clave: str) -> bool:
    intentos = _fallos.get(clave)
    if not intentos:
        return False
    ahora = time.monotonic()
    while intentos and ahora - intentos[0] > VENTANA_SEG:
        intentos.popleft()
    if not intentos:
        del _fallos[clave]
        return False
    return len(intentos) >= MAX_INTENTOS

def _verificar(password: str, hash_guardado: str) -> bool:
    clave = password.encode("utf-8")
    if len(clave) > 72:
        return False
    try:
        return bcrypt.checkpw(clave, hash_guardado.encode("utf-8"))
    except ValueError:
        return False

@router.post("/login", response_model=LoginResponse)
def login(datos: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "desconocida"
    clave = f"{ip}|{datos.username.lower()}"

    if _bloqueado(clave):
        raise HTTPException(
            status_code=429,
            detail="Demasiados intentos fallidos. Inténtalo de nuevo en unos minutos.",
        )

    fila = db.execute(
        text(
            """
            SELECT id_profesional, username, nombre_completo, rol, activo, password_hash
            FROM profesional_salud
            WHERE username = :username
            """
        ),
        {"username": datos.username},
    ).first()

    password_ok = _verificar(
        datos.password, fila.password_hash if fila else _HASH_RELLENO
    )

    if fila is None or not fila.activo or not password_ok:
        _fallos.setdefault(clave, deque()).append(time.monotonic())
        raise HTTPException(status_code=401, detail=MENSAJE_CREDENCIALES)

    _fallos.pop(clave, None)

    db.execute(
        text(
            """
            INSERT INTO auditoria
                (id_profesional, tabla_afectada, accion, id_registro,
                 valor_anterior, valor_nuevo, fecha_hora, ip_origen)
            VALUES
                (:id, 'profesional_salud', 'READ', :id,
                 NULL, CAST(:detalle AS jsonb), NOW(), :ip)
            """
        ),
        {"id": fila.id_profesional, "detalle": json.dumps({"evento": "login"}), "ip": ip},
    )
    db.commit()

    return LoginResponse(
        id_profesional=fila.id_profesional,
        username=fila.username,
        nombre_completo=fila.nombre_completo,
        rol=fila.rol,
    )