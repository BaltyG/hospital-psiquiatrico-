"use client";

import { useState } from "react";

export default function NotasPage() {
  const [idIngreso, setIdIngreso] = useState("1");
  const [notas, setNotas] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [tipoNota, setTipoNota] = useState("Evolución");
  const [contenido, setContenido] = useState("");
  const [gravedad, setGravedad] = useState("Leve");
  
  const [rolSimulado, setRolSimulado] = useState("PSIQUIATRA");

  // TODO: Usar process.env.NEXT_PUBLIC_API_URL
  const API_URL = "http://127.0.0.1:8000";

  const buscarNotas = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/clinica/notas/ingreso/${idIngreso}`, {
        headers: {
          "x-profesional-id": rolSimulado === "PSIQUIATRA" ? "1" : rolSimulado === "ENFERMERA" ? "2" : "99"
        }
      });
      
      if (!res.ok) {
        if (res.status === 403) throw new Error("No tienes permisos para ver las notas de este paciente.");
        throw new Error("Error al cargar las notas.");
      }
      
      const data = await res.json();
      setNotas(data);
    } catch (err: any) {
      setError(err.message);
      setNotas([]);
    } finally {
      setLoading(false);
    }
  };

  const guardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/clinica/notas/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-profesional-id": rolSimulado === "PSIQUIATRA" ? "1" : rolSimulado === "ENFERMERA" ? "2" : "99"
        },
        body: JSON.stringify({
          id_ingreso: parseInt(idIngreso),
          tipo_nota: tipoNota,
          contenido: contenido,
          gravedad_evento: gravedad,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 403) throw new Error("No tienes permisos para escribir notas.");
        if (res.status === 409) throw new Error("No se puede escribir una nota en un ingreso cerrado.");
        throw new Error(errorData.detail[0]?.msg || errorData.detail || "Error al guardar");
      }

      setContenido("");
      alert("¡Nota guardada con éxito!");
      buscarNotas();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-hospital-fondo min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-light text-slate-800">Línea de Tiempo - Notas Clínicas</h1>
        <p className="mt-1 text-sm text-slate-500">Historial de evolución por ingreso</p>
      </header>

      {/* Barra de Búsqueda y Simulador */}
      <div className="flex flex-wrap gap-4 mb-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm items-end">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">ID del Ingreso:</label>
          <input 
            type="number" value={idIngreso} onChange={(e) => setIdIngreso(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-hospital-secundario focus:outline-none focus:ring-2 focus:ring-hospital-secundario/40 w-32"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Simular Rol:</label>
          <select value={rolSimulado} onChange={(e) => setRolSimulado(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-hospital-secundario focus:outline-none focus:ring-2 focus:ring-hospital-secundario/40">
            <option value="PSIQUIATRA">PSIQUIATRA (ID 1)</option>
            <option value="ENFERMERA">ENFERMERA (ID 2)</option>
            <option value="AUDITOR">AUDITOR (ID 99 - 403)</option>
          </select>
        </div>
        <button onClick={buscarNotas} className="rounded-lg bg-hospital-secundario px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-800">
          Buscar Notas
        </button>
      </div>

      {error && <p className="text-red-700 mb-6 bg-red-50 p-4 rounded-lg border border-red-200">{error}</p>}

      {/* Formulario para agregar nota */}
      <form onSubmit={guardarNota} className="mb-10 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Agregar Nueva Nota</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select value={tipoNota} onChange={(e) => setTipoNota(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-hospital-secundario focus:outline-none focus:ring-2 focus:ring-hospital-secundario/40">
            <option value="Evolución">Evolución</option>
            <option value="Interconsulta">Interconsulta</option>
            <option value="Alta">Alta</option>
          </select>
          <select value={gravedad} onChange={(e) => setGravedad(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-hospital-secundario focus:outline-none focus:ring-2 focus:ring-hospital-secundario/40">
            <option value="Leve">Leve</option>
            <option value="Moderado">Moderado</option>
            <option value="Grave">Grave</option>
          </select>
        </div>
        <textarea 
          placeholder="Escriba el contenido de la nota clínica..." value={contenido} onChange={(e) => setContenido(e.target.value)} required
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-hospital-secundario focus:outline-none focus:ring-2 focus:ring-hospital-secundario/40 w-full mb-4 h-24 resize-none"
        />
        <button type="submit" className="rounded-lg bg-hospital-primario px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-900">
          Guardar Nota
        </button>
      </form>

      {/* Timeline de Notas */}
      <div className="border-l-4 border-hospital-secundario ml-6 pl-8 space-y-6">
        {loading && <p className="text-slate-500">Cargando notas...</p>}
        {!loading && notas.length === 0 && !error && (
          <p className="text-slate-500 bg-white p-4 rounded-lg border border-slate-200 inline-block">No hay notas registradas para este ingreso.</p>
        )}
        {notas.map((nota: any) => (
          <div key={nota.id_nota} className="relative bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="absolute -left-[42px] top-6 w-5 h-5 bg-hospital-secundario rounded-full border-4 border-white shadow-sm"></div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-lg text-hospital-primario">
                {nota.tipo_nota} 
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full ml-3">{nota.gravedad_evento}</span>
              </span>
              <span className="text-xs text-slate-400">{new Date(nota.fecha_hora).toLocaleString()}</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{nota.contenido}</p>
            <span className="text-xs text-slate-400 mt-3 block border-t border-slate-100 pt-2">Registrada por el Profesional ID: {nota.id_profesional}</span>
          </div>
        ))}
      </div>
    </div>
  );
}