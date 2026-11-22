"use client";

import { useEffect, useState } from "react";

// Interfaz para tipar los datos que vienen de FastAPI
interface RegistroAuditoria {
  id_auditoria: number;
  tabla_afectada: string;
  accion: string;
  valor_anterior: any;
  valor_nuevo: any;
  fecha_hora: string;
  ip_origen: string;
}

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuditoria = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/auditoria/");
        if (!response.ok) throw new Error("Error al conectar con el backend");
        const data = await response.json();
        setRegistros(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchAuditoria();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Auditoría del Sistema</h1>
        <p className="text-gray-500">Últimos 50 movimientos registrados</p>
      </div>

      {cargando && <p className="text-blue-500 font-medium">Cargando registros...</p>}
      {error && <p className="text-red-500 font-medium">Error: {error}</p>}

      {!cargando && !error && (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                <th scope="col" className="px-6 py-3">Tabla Afectada</th>
                <th scope="col" className="px-6 py-3">Acción</th>
                <th scope="col" className="px-6 py-3">IP Origen</th>
                <th scope="col" className="px-6 py-3">Valor Anterior</th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">No hay registros de auditoría.</td>
                </tr>
              ) : (
                registros.map((reg) => (
                  <tr key={reg.id_auditoria} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{reg.id_auditoria}</td>
                    <td className="px-6 py-4">{new Date(reg.fecha_hora).toLocaleString("es-MX")}</td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">{reg.tabla_afectada}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        reg.accion === "INSERT" ? "bg-green-100 text-green-800" :
                        reg.accion === "UPDATE" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {reg.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4">{reg.ip_origen}</td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {reg.valor_anterior ? JSON.stringify(reg.valor_anterior) : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}