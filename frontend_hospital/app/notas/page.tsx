"use client";

import { useState } from "react";

export default function NotasPage() {
  const [idIngreso, setIdIngreso] = useState("1");
  const [notas, setNotas] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados del formulario
  const [tipoNota, setTipoNota] = useState("Evolución");
  const [contenido, setContenido] = useState("");
  const [gravedad, setGravedad] = useState("Leve");
  
  // Simulador de sesión (Para probar los roles)
  const [rolSimulado, setRolSimulado] = useState("PSIQUIATRA");

  // Función para buscar las notas de un ingreso
  const buscarNotas = async () => {
    setLoading(true);
    setError("");
    try {
      // Mandamos el header según el rol simulado
      const res = await fetch(`http://127.0.0.1:8000/clinica/notas/ingreso/${idIngreso}`, {
        headers: {
          "x-profesional-id": rolSimulado === "PSIQUIATRA" ? "1" : rolSimulado === "ENFERMERA" ? "2" : "99"
        }
      });
      
      if (!res.ok) {
        if (res.status === 403) throw new Error("No tienes permisos para ver las notas de este paciente (Solo Psiquiatras y Enfermeras).");
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

  // Función para guardar una nueva nota
  const guardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/clinica/notas/", {
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
        if (res.status === 403) throw new Error("No tienes permisos para escribir notas (Solo Psiquiatras y Enfermeras).");
        if (res.status === 409) throw new Error("No se puede escribir una nota en un ingreso cerrado.");
        throw new Error(errorData.detail[0]?.msg || errorData.detail || "Error al guardar");
      }

      // Limpiar y recargar
      setContenido("");
      alert("¡Nota guardada con éxito!");
      buscarNotas();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Línea de Tiempo - Notas Clínicas</h1>

      {/* Barra de búsqueda y simulador de rol */}
      <div className="flex gap-4 mb-6 bg-gray-100 p-4 rounded">
        <div>
          <label className="block text-sm font-bold mb-1">ID del Ingreso:</label>
          <input 
            type="number" 
            value={idIngreso} 
            onChange={(e) => setIdIngreso(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Simular Rol:</label>
          <select value={rolSimulado} onChange={(e) => setRolSimulado(e.target.value)} className="border p-2 rounded">
            <option value="PSIQUIATRA">PSIQUIATRA (ID 1)</option>
            <option value="ENFERMERA">ENFERMERA (ID 2)</option>
            <option value="AUDITOR">AUDITOR (ID 99 - No puede ver)</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={buscarNotas} className="bg-blue-600 text-white px-4 py-2 rounded">
            Buscar Notas
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4 bg-red-50 p-2 rounded">{error}</p>}

      {/* Formulario para agregar nota */}
      <form onSubmit={guardarNota} className="mb-8 border p-4 rounded bg-white shadow-sm">
        <h2 className="font-bold mb-4">Agregar Nueva Nota</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select value={tipoNota} onChange={(e) => setTipoNota(e.target.value)} className="border p-2 rounded">
            <option value="Evolución">Evolución</option>
            <option value="Interconsulta">Interconsulta</option>
            <option value="Alta">Alta</option>
          </select>
          <select value={gravedad} onChange={(e) => setGravedad(e.target.value)} className="border p-2 rounded">
            <option value="Leve">Leve</option>
            <option value="Moderado">Moderado</option>
            <option value="Grave">Grave</option>
          </select>
        </div>
        <textarea 
          placeholder="Escriba el contenido de la nota clínica..." 
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          className="border p-2 rounded w-full mb-4 h-24"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">
          Guardar Nota
        </button>
      </form>

      {/* Timeline de Notas */}
      <div className="border-l-4 border-blue-500 ml-4 pl-6 space-y-6">
        {loading && <p>Cargando notas...</p>}
        {!loading && notas.length === 0 && !error && (
          <p className="text-gray-500">No hay notas registradas para este ingreso (o no se han buscado).</p>
        )}
        {notas.map((nota: any) => (
          <div key={nota.id_nota} className="relative bg-white p-4 rounded shadow border">
            <div className="absolute -left-8 top-4 w-4 h-4 bg-blue-500 rounded-full"></div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-blue-700">{nota.tipo_nota} - {nota.gravedad_evento}</span>
              <span className="text-sm text-gray-500">
                {new Date(nota.fecha_hora).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-800">{nota.contenido}</p>
            <span className="text-xs text-gray-400 mt-2 block">Registrada por el Profesional ID: {nota.id_profesional}</span>
          </div>
        ))}
      </div>
    </div>
  );
}