"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { leerSesion } from "../lib/sesion";
import { API_URL } from "../pacientes/datosApi";

interface Diagnostico {
  id_diagnostico: number;
  codigo_cie10: string;
  nombre_diagnostico: string;
  categoria: string;
}

type Orden = "recientes" | "codigo";

const FORMATO_CIE10 = /^[A-Z][0-9]{2}(\.[0-9A-Z]{1,4})?$/;

const CAMPO =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#0B7A86] focus:outline-none focus:ring-2 focus:ring-[#0B7A86]/40";
const ETIQUETA = "mb-1 block text-sm font-medium text-slate-700";
const TH = "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600";

// Quita acentos y mayúsculas para buscar de forma tolerante
const normalizar = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function cabeceras(json = false): Record<string, string> {
  const sesion = leerSesion();
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(sesion ? { "X-Profesional-Id": String(sesion.id_profesional) } : {}),
  };
}

function textoDeError(detail: unknown, respaldo: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail[0]?.msg || "Error de validación en los datos.";
  if (detail && typeof detail === "object" && "mensaje" in detail) {
    return String((detail as { mensaje: unknown }).mensaje);
  }
  return respaldo;
}

export default function DiagnosticosPage() {
  const codigoRef = useRef<HTMLInputElement>(null);

  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

<<<<<<< HEAD
export default function ClinicaPage() {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [error, setError] = useState("");
  
=======
>>>>>>> origin/main
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [exito, setExito] = useState("");
  const [resaltadoId, setResaltadoId] = useState<number | null>(null);

<<<<<<< HEAD
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
=======
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [orden, setOrden] = useState<Orden>("recientes");

  const cargar = useCallback(async (silencioso = false): Promise<Diagnostico[] | null> => {
    if (!silencioso) setCargando(true);
    setErrorCarga(null);
    try {
      const res = await fetch(`${API_URL}/clinica/diagnosticos/`, { headers: cabeceras() });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Tu sesión no es válida. Vuelve a iniciar sesión.");
        if (res.status === 403) throw new Error("Tu rol no tiene acceso al catálogo de diagnósticos.");
        throw new Error("Error al cargar el catálogo.");
      }
      const datos: Diagnostico[] = await res.json();
      setDiagnosticos(datos);
      return datos;
    } catch (e) {
      setErrorCarga(
        e instanceof TypeError
          ? "No se pudo conectar con el backend. ¿Está encendido?"
          : e instanceof Error
          ? e.message
          : "Error al cargar el catálogo."
      );
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);
>>>>>>> origin/main

  // El mensaje de éxito desaparece solo
  useEffect(() => {
    if (!exito) return;
    const t = setTimeout(() => setExito(""), 4000);
    return () => clearTimeout(t);
  }, [exito]);

  // La fila nueva se muestra a la vista y se resalta unos segundos
  useEffect(() => {
    if (resaltadoId === null) return;
    document
      .getElementById(`dx-${resaltadoId}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const t = setTimeout(() => setResaltadoId(null), 6000);
    return () => clearTimeout(t);
  }, [resaltadoId]);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setErrorForm("");
    setExito("");
    setGuardando(true);

    const codigoLimpio = codigo.trim();
    try {
      const res = await fetch(`${API_URL}/clinica/diagnosticos/`, {
        method: "POST",
        headers: cabeceras(true),
        body: JSON.stringify({
          codigo_cie10: codigoLimpio,
          nombre_diagnostico: nombre.trim(),
          categoria: categoria.trim(),
        }),
      });
      if (!res.ok) {
<<<<<<< HEAD
        const errorData = await res.json();
        let mensajeError = "Error al guardar el diagnóstico.";
        if (typeof errorData.detail === "string") mensajeError = errorData.detail;
        else if (Array.isArray(errorData.detail)) mensajeError = errorData.detail[0].msg || "Error de validación.";
        throw new Error(mensajeError);
      }

=======
        const cuerpo = await res.json().catch(() => null);
        if (res.status === 403) throw new Error("Tu rol no puede crear diagnósticos.");
        throw new Error(textoDeError(cuerpo?.detail, "Error al guardar el diagnóstico."));
      }

      const creado = await res.json().catch(() => null);

      // Listo para el siguiente: se limpian código y nombre, la categoría se conserva
>>>>>>> origin/main
      setCodigo("");
      setNombre("");
      setBusqueda("");
      setFiltroCategoria("");
      codigoRef.current?.focus();

      const datos = await cargar(true);
      const id =
        creado?.id_diagnostico ??
        datos?.find((d) => d.codigo_cie10 === codigoLimpio)?.id_diagnostico ??
        null;
      setResaltadoId(id);
      setExito(`Se agregó ${codigoLimpio}.`);
    } catch (err) {
      setErrorForm(
        err instanceof TypeError
          ? "No se pudo conectar con el backend."
          : err instanceof Error
          ? err.message
          : "Error al guardar el diagnóstico."
      );
    } finally {
      setGuardando(false);
    }
  }

  /* ----------------------- Datos derivados ----------------------- */
  const categorias = useMemo(
    () => Array.from(new Set(diagnosticos.map((d) => d.categoria))).sort((a, b) => a.localeCompare(b)),
    [diagnosticos]
  );

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    const lista = diagnosticos.filter(
      (d) =>
        (!filtroCategoria || d.categoria === filtroCategoria) &&
        (!q || normalizar(d.codigo_cie10).includes(q) || normalizar(d.nombre_diagnostico).includes(q))
    );
    return lista.sort(
      orden === "codigo"
        ? (a, b) => a.codigo_cie10.localeCompare(b.codigo_cie10)
        : (a, b) => b.id_diagnostico - a.id_diagnostico
    );
  }, [diagnosticos, busqueda, filtroCategoria, orden]);

  // Avisos mientras se escribe (no bloquean el guardado: decide el backend)
  const codigoLimpio = codigo.trim();
  const formatoValido = codigoLimpio === "" ? null : FORMATO_CIE10.test(codigoLimpio);
  const yaExiste = codigoLimpio !== "" && diagnosticos.some((d) => d.codigo_cie10 === codigoLimpio);

  const hayDatos = !cargando && !errorCarga;
  const total = diagnosticos.length;

  return (
<<<<<<< HEAD
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
=======
    <div className="space-y-6 p-8">
      <header>
        <h1 className="text-3xl font-light text-slate-800">Diagnósticos</h1>
        <p className="mt-1 text-sm text-slate-500">Catálogo CIE-10: agrega y consulta diagnósticos</p>
      </header>

      {/* ------------------------ Captura rápida ------------------------ */}
      <section
        aria-labelledby="titulo-nuevo"
        className="rounded-xl border border-slate-200 border-l-4 border-l-[#0B7A86] bg-white p-5 shadow-sm"
      >
        <h2 id="titulo-nuevo" className="mb-4 text-lg font-semibold text-slate-800">
          Agregar diagnóstico
        </h2>

        <form onSubmit={guardar}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[9rem_minmax(0,1fr)_15rem_auto] md:items-start">
            <div>
              <label htmlFor="codigo" className={ETIQUETA}>
                Código CIE-10
              </label>
              <input
                ref={codigoRef}
                id="codigo"
                type="text"
                required
                autoFocus
                autoComplete="off"
                placeholder="F32.9"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                aria-describedby="ayuda-codigo"
                className={CAMPO + " font-mono"}
              />
              <p
                id="ayuda-codigo"
                className={`mt-1 text-xs ${
                  yaExiste ? "text-amber-700" : formatoValido === false ? "text-amber-700" : formatoValido ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {yaExiste
                  ? "Ya existe en el catálogo."
                  : formatoValido === null
                  ? "Letra, 2 dígitos y decimales opcionales."
                  : formatoValido
                  ? "Formato válido."
                  : "Formato esperado: F32.9"}
              </p>
            </div>

            <div>
              <label htmlFor="nombre-dx" className={ETIQUETA}>
                Nombre del diagnóstico
              </label>
              <input
                id="nombre-dx"
                type="text"
                required
                autoComplete="off"
                placeholder="Episodio depresivo, no especificado"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={CAMPO}
              />
            </div>

            <div>
              <label htmlFor="categoria-dx" className={ETIQUETA}>
                Categoría
              </label>
              <input
                id="categoria-dx"
                type="text"
                required
                autoComplete="off"
                list="categorias-existentes"
                placeholder="Trastornos del ánimo"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className={CAMPO}
              />
              <datalist id="categorias-existentes">
                {categorias.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="md:pt-6">
              <button
                type="submit"
                disabled={guardando}
                className="w-full rounded-lg bg-[#0B7A86] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#096570] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                {guardando ? "Guardando..." : "Agregar"}
              </button>
            </div>
          </div>

          {errorForm && (
            <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {errorForm}
            </p>
          )}
          {exito && (
            <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {exito}
            </p>
          )}
          
        </form>
      </section>

      {/* --------------------------- Catálogo --------------------------- */}
      <section
        aria-labelledby="titulo-catalogo"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-5">
          <h2 id="titulo-catalogo" className="mr-auto text-lg font-semibold text-slate-800">
            Catálogo
          </h2>

          <div className="w-full sm:w-56">
            <label htmlFor="buscar-dx" className="sr-only">
              Buscar por código o nombre
            </label>
            <input
              id="buscar-dx"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar código o nombre"
              className={CAMPO}
            />
          </div>

          <div className="w-full sm:w-52">
            <label htmlFor="filtro-categoria" className="sr-only">
              Filtrar por categoría
            </label>
            <select
              id="filtro-categoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={CAMPO}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div role="group" aria-label="Ordenar" className="inline-flex overflow-hidden rounded-lg border border-slate-300 text-xs font-medium">
            {(
              [
                ["recientes", "Más recientes"],
                ["codigo", "Código"],
              ] as [Orden, string][]
            ).map(([valor, etiqueta]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={orden === valor}
                onClick={() => setOrden(valor)}
                className={`px-3 py-2 transition-colors ${
                  orden === valor ? "bg-[#1E4E8C] text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </div>

        {hayDatos && (
          <p aria-live="polite" className="border-b border-slate-100 px-6 py-2 text-xs text-slate-500">
            Mostrando {visibles.length} de {total} diagnósticos
          </p>
        )}

        {errorCarga ? (
          <div role="alert" className="bg-red-50 p-8 text-center">
            <p className="text-sm text-red-800">{errorCarga}</p>
            <button
              type="button"
              onClick={() => cargar()}
              className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className={TH}>Código</th>
                  <th scope="col" className={TH}>Nombre</th>
                  <th scope="col" className={TH}>Categoría</th>
                  <th scope="col" className={TH + " text-right"}>ID</th>
                </tr>
              </thead>
              <tbody>
                {cargando &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {hayDatos && visibles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      {total === 0
                        ? "Aún no hay diagnósticos. Agrega el primero arriba."
                        : "Ningún diagnóstico coincide con los filtros."}
                    </td>
                  </tr>
                )}

                {hayDatos &&
                  visibles.map((d) => (
                    <tr
                      id={`dx-${d.id_diagnostico}`}
                      key={d.id_diagnostico}
                      className={`border-t border-slate-100 transition-colors duration-700 hover:bg-slate-50 ${
                        resaltadoId === d.id_diagnostico ? "bg-teal-50" : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-6 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-800">
                          {d.codigo_cie10}
                        </span>
                        {resaltadoId === d.id_diagnostico && (
                          <span className="ml-2 rounded-full bg-[#0B7A86] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Nuevo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-slate-800">{d.nombre_diagnostico}</td>
                      <td className="whitespace-nowrap px-6 py-3">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
                          {d.categoria}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right text-slate-400">
                        {d.id_diagnostico}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
>>>>>>> origin/main
    </div>
  );
}