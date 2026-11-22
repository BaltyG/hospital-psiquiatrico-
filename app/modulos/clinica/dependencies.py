from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from app.database import get_db

def requerir_rol_clinica(*roles_permitidos: str):
    def verificar_rol(x_profesional_id: int = Header(None), db: Session = Depends(get_db)):
        if not x_profesional_id:
            raise HTTPException(status_code=401, detail="Falta el header X-Profesional-Id")
        
        # Consulta SQL directa a la tabla real
        query = text("SELECT rol, activo FROM profesional_salud WHERE id_profesional = :id")
        resultado = db.execute(query, {"id": x_profesional_id}).fetchone()
        
        if not resultado:
            raise HTTPException(status_code=401, detail="Profesional no encontrado")
            
        rol_db, activo = resultado
        if not activo:
            raise HTTPException(status_code=401, detail="Profesional inactivo")
            
        if rol_db not in roles_permitidos:
            raise HTTPException(status_code=403, detail="No tienes permisos para realizar esta acción")
            
        # Objeto simple para que las rutas puedan usar .id_profesional
        class UsuarioActual:
            def __init__(self, id_profesional):
                self.id_profesional = id_profesional
                
        return UsuarioActual(x_profesional_id)
    return verificar_rol