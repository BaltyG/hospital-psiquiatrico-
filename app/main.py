from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importación de TODOS los módulos
from app.modulos.pacientes.routes import router as pacientes_router
from app.modulos.clinica.routes import router as clinica_router
from app.modulos.auditoria.routes import router as auditoria_router
from app.modulos.farmacia.routes import router as farmacia_router  # <-- Agregado

app = FastAPI(
    title="API Hospital Psiquiátrico Modular",
    version="2.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def ruta_raiz():
    return {"mensaje": "API Modular funcionando correctamente"}

# Conexión de TODOS los módulos
app.include_router(pacientes_router, prefix="/pacientes", tags=["Pacientes"])
app.include_router(clinica_router, prefix="/clinica", tags=["Clínica"])
app.include_router(auditoria_router, prefix="/auditoria", tags=["Auditoría"])
app.include_router(farmacia_router, prefix="/farmacia", tags=["Farmacia"])  