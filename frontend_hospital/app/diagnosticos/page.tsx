"use client";

import { useEffect, useState } from "react";

export default function ClinicaPage() {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [error, setError] = useState("");
  
  // Estados para el formulario
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");

  // Función para traer los datos (GET)
  const cargarDiagnosticos = () => {
    fetch("http://127.0.0.1:8000/clinica/diagnosticos/")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar datos");
        return res.json();
      })
      .then((data) => setDiagnosticos(data))
      .catch((err) => setError("No se pudo conectar con el backend. ¿Está encendido?"));
  };

  // Se ejecuta al cargar la página
  useEffect(() => {
    cargarDiagnosticos();
  }, []);

    const guardarDiagnostico = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/clinica/diagnosticos/", {
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
        
        // Si el backend manda un texto directo (como en el 409 o 400)
        if (typeof errorData.detail === "string") {
          mensajeError = errorData.detail;
        } 
        // Si el backend manda un arreglo de errores (como el 422 de Pydantic)
        else if (Array.isArray(errorData.detail)) {
          mensajeError = errorData.detail[0].msg || "Error de validación en los datos.";
        }

        throw new Error(mensajeError);
      }

      // Limpiar formulario y recargar la tabla
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Panel Clínico - Diagnósticos</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* --- FORMULARIO PARA CREAR DIAGNÓSTICO --- */}
      <form onSubmit={guardarDiagnostico} className="mb-6 flex flex-col gap-2 max-w-md">
        <input 
          type="text" 
          placeholder="Código CIE-10 (ej. F32.9)" 
          value={codigo} 
          onChange={(e) => setCodigo(e.target.value)} 
          required 
          className="border p-2 rounded"
        />
        <input 
          type="text" 
          placeholder="Nombre del diagnóstico" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          required 
          className="border p-2 rounded"
        />
        <input 
          type="text" 
          placeholder="Categoría" 
          value={categoria} 
          onChange={(e) => setCategoria(e.target.value)} 
          required 
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Guardar Diagnóstico
        </button>
      </form>
      {/* ---------------------------------------- */}

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Código CIE-10</th>
            <th className="py-2 px-4 border-b">Nombre</th>
            <th className="py-2 px-4 border-b">Categoría</th>
          </tr>
        </thead>
        <tbody>
          {diagnosticos.map((diag: any) => (
            <tr key={diag.id_diagnostico} className="text-center">
              <td className="py-2 px-4 border-b">{diag.id_diagnostico}</td>
              <td className="py-2 px-4 border-b">{diag.codigo_cie10}</td>
              <td className="py-2 px-4 border-b">{diag.nombre_diagnostico}</td>
              <td className="py-2 px-4 border-b">{diag.categoria}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {diagnosticos.length === 0 && !error && (
        <p className="mt-4">No hay diagnósticos registrados aún.</p>
      )}
    </div>
  );
}