"use client";

import { useEffect, useState } from "react";
import { API_URL, headersAdmin } from "../pacientes/datosApi";
import { leerSesion } from "../lib/sesion";

interface RegistroAuditoria {
  id_auditoria: number;
  id_profesional: number;
  nombre_completo?: string | null;
  tabla_afectada: string;
  accion: string;
  id_registro: number;
  valor_anterior: Record<string, any> | null;
  valor_nuevo: Record<string, any> | null;
  fecha_hora: string;
  ip_origen: string;
}

const ACCIONES = ["TODAS", "INSERT", "UPDATE", "DELETE", "READ"] as const;

export default function AuditoriaPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroAccion, setFiltroAccion] = useState<string>("TODAS");
  const [busqueda, setBusqueda] = useState("");
  const [registroDetalle, setRegistroDetalle] = useState<RegistroAuditoria | null>(null);

  const cargarAuditoria = async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auditoria/`, {
        headers: {
          ...headersAdmin(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "No se pudo cargar la bitácora de auditoría.");
      }

      if (Array.isArray(data)) {
        setRegistros(data);
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const sesion = leerSesion();
    const rol = sesion ? String(sesion.rol).toUpperCase() : "";
    const tienePermiso = rol === "AUDITOR" || rol === "ADMIN";
    setAutorizado(tienePermiso);

    if (tienePermiso) {
      cargarAuditoria();
    } else {
      setCargando(false);
    }
  }, []);

  const badgeAccion = (accion: string) => {
    switch (accion.toUpperCase()) {
      case "INSERT":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "UPDATE":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-200";
      case "READ":
        return "bg-sky-100 text-[#1E4E8C] border-sky-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const registrosFiltrados = registros.filter((reg) => {
    const coincideAccion =
      filtroAccion === "TODAS" || reg.accion.toUpperCase() === filtroAccion;

    const q = busqueda.trim().toLowerCase();
    if (!q) return coincideAccion;

    const profesional = (reg.nombre_completo || `Profesional #${reg.id_profesional}`).toLowerCase();
    return (
      coincideAccion &&
      (profesional.includes(q) ||
        reg.tabla_afectada.toLowerCase().includes(q) ||
        reg.ip_origen.toLowerCase().includes(q) ||
        String(reg.id_auditoria).includes(q))
    );
  });

  if (autorizado === false) {
    return (
      <div className="p-8">
        <div className="max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
            Acceso Restringido
          </span>
          <h1 className="mt-2 text-xl font-semibold text-slate-800">
            Módulo exclusivo de Auditoría
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Su rol actual no cuenta con privilegios para consultar los registros de trazabilidad del sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-slate-800">Auditoría del Sistema</h1>
          <p className="mt-1 text-sm text-slate-500">
            Trazabilidad de seguridad y últimos 50 movimientos registrados en base de datos
          </p>
        </div>

        <button
          type="button"
          onClick={cargarAuditoria}
          disabled={cargando}
          className="rounded-lg bg-[#0B7A86] px-4 py-2 text-sm font-medium text-white hover:bg-[#096570] disabled:opacity-50 transition-colors"
        >
          {cargando ? "Actualizando..." : "Actualizar bitácora"}
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {ACCIONES.map((acc) => {
              const activo = filtroAccion === acc;
              return (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setFiltroAccion(acc)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activo
                      ? "bg-[#1E4E8C] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {acc === "TODAS" ? "Todas" : acc}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {registrosFiltrados.length} de {registros.length} eventos
            </span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar profesional, tabla o IP..."
              className="w-full sm:w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Profesional
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tabla Afectada
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  IP Origen
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Cargando registros de auditoría...
                  </td>
                </tr>
              ) : registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron movimientos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((reg) => (
                  <tr
                    key={reg.id_auditoria}
                    onClick={() => setRegistroDetalle(reg)}
                    title="Clic para ver el detalle"
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-slate-600">
                      #{reg.id_auditoria}
                    </td>
                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                      {new Date(reg.fecha_hora).toLocaleString("es-MX", {
                        dateStyle: "short",
                        timeStyle: "medium",
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {reg.nombre_completo || `Profesional #${reg.id_profesional}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 border border-slate-200">
                        {reg.tabla_afectada}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeAccion(
                          reg.accion
                        )}`}
                      >
                        {reg.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {reg.ip_origen}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {registroDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeAccion(
                    registroDetalle.accion
                  )}`}
                >
                  {registroDetalle.accion}
                </span>
                <h3 className="mt-1.5 text-lg font-semibold text-slate-900">
                  Detalle de Auditoría #{registroDetalle.id_auditoria}
                </h3>
                <p className="text-xs text-slate-500">
                  Tabla: <span className="font-mono">{registroDetalle.tabla_afectada}</span> · Registro ID:{" "}
                  <span className="font-mono">{registroDetalle.id_registro}</span> · Profesional:{" "}
                  {registroDetalle.nombre_completo || `#${registroDetalle.id_profesional}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRegistroDetalle(null)}
                className="text-sm font-medium text-slate-400 hover:text-slate-600"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Valor Anterior
                </p>
                <pre className="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">
                  {registroDetalle.valor_anterior
                    ? JSON.stringify(registroDetalle.valor_anterior, null, 2)
                    : "Sin estado previo (null)"}
                </pre>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Valor Nuevo
                </p>
                <pre className="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">
                  {registroDetalle.valor_nuevo
                    ? JSON.stringify(registroDetalle.valor_nuevo, null, 2)
                    : "Sin estado posterior (null)"}
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setRegistroDetalle(null)}
                className="rounded-lg bg-[#1E4E8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#173d6e]"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}