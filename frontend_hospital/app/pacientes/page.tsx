"use client";

import { useEffect, useState } from "react";


interface Paciente {
  expediente: string;
  nombre: string;
  fecha_nacimiento: string;
  sexo: string;
  tipo_paciente: string;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hacemos la petición a la API de FastAPI
    fetch("http://127.0.0.1:8000/pacientes/")
      .then((res) => {
        if (!res.ok) throw new Error("Error al conectar con la base de datos");
        return res.json();
      })
      .then((data) => {
        setPacientes(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar los pacientes. Verifica que el backend y PostgreSQL estén encendidos.");
        setCargando(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Encabezado de la página */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Directorio de Pacientes</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de expedientes y datos demográficos</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm">
          + Nuevo Paciente
        </button>
      </div>

      {/* Tabla de datos */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-gray-500">Cargando pacientes...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-red-50">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expediente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">F. Nacimiento</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sexo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pacientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay pacientes registrados.</td>
                </tr>
              ) : (
                pacientes.map((paciente) => (
                  <tr key={paciente.expediente} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{paciente.expediente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{paciente.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.fecha_nacimiento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paciente.sexo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {paciente.tipo_paciente}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}