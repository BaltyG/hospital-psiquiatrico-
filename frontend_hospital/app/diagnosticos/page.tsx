"use client";

import { useEffect, useState } from "react";

export default function ClinicaPage() {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [error, setError] = useState("");
  
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");

  // TODO: Usar process.env.NEXT_PUBLIC_API_URL
  const API_URL = "http://127.0.0.1:8000";

  const cargarDiagnosticos = () => {
    fetch(`${API_URL}/clinica/diagnosticos/`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar datos");
        return res.json();
      })
      .then((data) => setDiagnosticos(data))
      .catch((err) => setError("No se pudo conectar con el backend. ¿Está encendido?"));
  };

  useEffect(() => {
    cargarDiagnosticos();
  }, []);

  const guardarDiagnostico = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/clinica/diagnosticos/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo_cie10: codigo,
          nombre_diagnostico: nombre,
          categoria: categoria,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        let mensajeError = "Error al guardar el diagnóstico.";
        if (typeof errorData.detail === "string") mensajeError = errorData.detail;
        else if (Array.isArray(errorData.detail)) mensajeError = errorData.detail[0].msg || "Error de validación.";
        throw new Error(mensajeError);
      }

      setCodigo("");
      setNombre("");
      setCategoria("");
      cargarDiagnosticos(); 
      alert("¡Diagnóstico guardado con éxito!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 bg-hospital-fondo min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-light text-slate-800">Panel Clínico - Diagnósticos</h1>
        <p className="mt-1 text-sm text-slate-500">Catálogo CIE-10 y diagnósticos asociados</p>
      </header>
      
      {error && <p className="text-red-700 mb-4 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}

      {/* Formulario en Tarjeta */}
      <form onSubmit={guardarDiagnostico} className="mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-800">Agregar Nuevo Diagnóstico</h2>
        <input 
          type="text" placeholder="Código CIE-10 (ej. F32.9)" value={codigo} onChange={(e) => setCodigo(e.target.value)} required 
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-hospital-secundario focus:outline-none focus:ring-2 focus:ring-hospital-secundario/40"
        />
        <input 
          type="text" placeholder="Nombre del diagnóstico" value={nombre} onChange={(e) => setNombre(e.target.value)} required 
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-hospital-secundario focus:outline-none focus:ring-2 focus:ring-hospital-secundario/40"
        />
        <input 
          type="text" placeholder="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)} required 
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-hospital-secundario focus:outline-none focus:ring-2 focus:ring-hospital-secundario/40"
        />
        <button type="submit" className="rounded-lg bg-hospital-primario px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-900 mt-2">
          Guardar Diagnóstico
        </button>
      </form>

      {/* Tabla Estilizada */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">ID</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Código CIE-10</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Nombre</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Categoría</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {diagnosticos.map((diag: any) => (
              <tr key={diag.id_diagnostico} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-800">{diag.id_diagnostico}</td>
                <td className="px-6 py-4 font-medium text-hospital-primario">{diag.codigo_cie10}</td>
                <td className="px-6 py-4 text-slate-800">{diag.nombre_diagnostico}</td>
                <td className="px-6 py-4 text-slate-600">{diag.categoria}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {diagnosticos.length === 0 && !error && (
          <p className="p-6 text-center text-slate-500">No hay diagnósticos registrados aún.</p>
        )}
      </div>
    </div>
  );
}