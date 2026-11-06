from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Aquí iremos importando las rutas de los módulos después
# from app.modulos.farmacia.routes import router as farmacia_router

from app.modulos.clinica.routes import router as clinica_router

from app.modulos.auditoria.routes import router as auditoria_router


app = FastAPI(
    title="API Hospital Psiquiátrico Modular",
    version="2.0.0"
)

@app.get("/")
def ruta_raiz():
    return {"mensaje": "API Modular funcionando correctamente"}

# Aquí se conectarán los módulos:
# app.include_router(farmacia_router, prefix="/farmacia", tags=["Farmacia"])

app.include_router(clinica_router, prefix="/clinica", tags=["Clínica"])

app.include_router(auditoria_router, prefix="/auditoria", tags=["Auditoría"])

