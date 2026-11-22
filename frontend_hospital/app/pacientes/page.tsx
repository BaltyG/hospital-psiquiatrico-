"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { leerSesion } from "../lib/sesion";
import { API_URL } from "./datosApi";
import ExportarCsvButton from "./ExportarCsvButton";
import ImportarCsvButton from "./ImportarCsvButton";

interface Paciente {
  expediente: string;
  nombre: string;
  fecha_nacimiento: string;
  sexo: string;
  tipo_paciente: string;
}

const SEXO: Record<string, string> = { M: "Masculino", F: "Femenino", OTRO: "Otro" };

const ESTILO_TIPO: Record<string, string> = {
  Adulto: "bg-blue-50 text-blue-800",
  Infantil: "bg-teal-50 text-teal-800",
};
const ESTILO_TIPO_DEFECTO = "bg-slate-100 text-slate-700";

const TH = "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600";

function formatearFecha(valor: string) {
  const [anio, mes, dia] = valor.slice(0, 10).split("-");
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : valor;
}

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/pacientes/`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setPacientes(await res.json());
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los pacientes. Verifica que el backend y PostgreSQL estén encendidos.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    setEsAdmin(leerSesion()?.rol === "ADMIN");
  }, [cargar]);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return pacientes;
    return pacientes.filter(
      (p) => normalizar(p.expediente).includes(q) || normalizar(p.nombre).includes(q)
    );
  }, [pacientes, busqueda]);

  return (
    <div className="space-y-6 p-8">
      {/* Encabezado */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-slate-800">Directorio de Pacientes</h1>
          <p className="mt-1 text-sm text-slate-500">Gestión de expedientes y datos demográficos</p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-[#0B7A86] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#096570]"
        >
          + Nuevo paciente
        </button>
      </header>

      {/* Importar / exportar: solo ADMIN */}
      {esAdmin && (
        <details className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-[#1E4E8C]">
            Importar y exportar datos (administración)
          </summary>
          <div className="flex flex-wrap items-start gap-10 border-t border-slate-100 p-5">
            <ExportarCsvButton />
            <ImportarCsvButton />
          </div>
        </details>
      )}

      {/* Buscador y contador */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-sm">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por expediente o nombre"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#0B7A86] focus:outline-none focus:ring-2 focus:ring-[#0B7A86]/40"
          />
        </div>
        {!cargando && !error && (
          <p className="text-sm text-slate-500">
            Mostrando {filtrados.length} de {pacientes.length} pacientes
          </p>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div role="alert" className="bg-red-50 p-8 text-center">
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={cargar} className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100">
              Reintentar
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className={TH}>Expediente</th>
                  <th scope="col" className={TH}>Nombre</th>
                  <th scope="col" className={TH}>F. nacimiento</th>
                  <th scope="col" className={TH}>Sexo</th>
                  <th scope="col" className={TH}>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {cargando && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" /></td>
                    ))}
                  </tr>
                ))}
                {!cargando && filtrados.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">{pacientes.length === 0 ? "No hay pacientes registrados." : `Ningún paciente coincide con «${busqueda}».`}</td></tr>
                )}
                {!cargando && filtrados.map((p) => (
                  <tr key={p.expediente} className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 font-mono font-medium text-slate-800">{p.expediente}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-800">{p.nombre}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">{formatearFecha(p.fecha_nacimiento)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">{SEXO[p.sexo] ?? p.sexo}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ESTILO_TIPO[p.tipo_paciente] ?? ESTILO_TIPO_DEFECTO}`}>{p.tipo_paciente}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}