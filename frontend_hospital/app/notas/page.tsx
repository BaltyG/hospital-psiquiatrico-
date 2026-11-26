"use client";

import { FormEvent, useEffect, useState } from "react";
import { leerSesion, type Sesion } from "../lib/sesion";
import { API_URL } from "../pacientes/datosApi";

interface Nota {
  id_nota: number;
  id_profesional: number;
  tipo_nota: string;
  gravedad_evento: string | null;
  fecha_hora: string;
  contenido: string;
}

// Solo para pruebas: NEXT_PUBLIC_SIMULAR_ROL=true en .env.local
const SIMULAR_ROL = process.env.NEXT_PUBLIC_SIMULAR_ROL === "true";
const ID_SIMULADO: Record<string, string> = { PSIQUIATRA: "1", ENFERMERA: "2", AUDITOR: "99" };
const ROLES_CON_ACCESO = ["PSIQUIATRA", "ENFERMERA"];

// El texto siempre se muestra: el color nunca es la única señal
const ESTILO_GRAVEDAD: Record<string, string> = {
  Leve: "bg-teal-50 text-teal-800",
  Moderado: "bg-amber-100 text-amber-800",
  Grave: "bg-red-100 text-red-800",
};

const CAMPO =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#0B7A86] focus:outline-none focus:ring-2 focus:ring-[#0B7A86]/40";
const ETIQUETA = "mb-1 block text-sm font-medium text-slate-700";

function textoDeError(detail: unknown, respaldo: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail[0]?.msg ?? respaldo;
  if (detail && typeof detail === "object" && "mensaje" in detail) {
    return String((detail as { mensaje: unknown }).mensaje);
  }
  return respaldo;
}

export default function NotasPage() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);
  const [rolSimulado, setRolSimulado] = useState("PSIQUIATRA");

  const [idIngreso, setIdIngreso] = useState("1");
  const [notas, setNotas] = useState<Nota[]>([]);
  const [buscado, setBuscado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [tipoNota, setTipoNota] = useState("Evolución");
  const [gravedad, setGravedad] = useState("Leve");
  const [contenido, setContenido] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setSesion(leerSesion());
    setListo(true);
  }, []);

  // El mensaje de éxito desaparece solo
  useEffect(() => {
    if (!exito) return;
    const t = setTimeout(() => setExito(""), 4000);
    return () => clearTimeout(t);
  }, [exito]);

  const rolActivo = SIMULAR_ROL ? rolSimulado : sesion?.rol ?? null;
  const puedeUsar = rolActivo !== null && ROLES_CON_ACCESO.includes(rolActivo);

  function cabeceras(json = false): Record<string, string> {
    const id = SIMULAR_ROL
      ? ID_SIMULADO[rolSimulado]
      : sesion
      ? String(sesion.id_profesional)
      : null;
    return {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(id ? { "X-Profesional-Id": id } : {}),
    };
  }

  async function buscarNotas(e?: FormEvent) {
    e?.preventDefault();
    setCargando(true);
    setError("");
    setExito("");
    try {
      const res = await fetch(`${API_URL}/clinica/notas/ingreso/${idIngreso}`, {
        headers: cabeceras(),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Tu sesión no es válida. Vuelve a iniciar sesión.");
        if (res.status === 403)
          throw new Error(
            "No tienes permisos para ver las notas de este paciente (solo psiquiatras y enfermeras)."
          );
        if (res.status === 404) throw new Error("No existe un ingreso con ese número.");
        throw new Error("Error al cargar las notas.");
      }
      setNotas(await res.json());
      setBuscado(true);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor."
          : err instanceof Error
          ? err.message
          : "Error al cargar las notas."
      );
      setNotas([]);
      setBuscado(false);
    } finally {
      setCargando(false);
    }
  }

  async function guardarNota(e: FormEvent) {
    e.preventDefault();
    setError("");
    setExito("");
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/clinica/notas/`, {
        method: "POST",
        headers: cabeceras(true),
        body: JSON.stringify({
          id_ingreso: parseInt(idIngreso, 10),
          tipo_nota: tipoNota,
          contenido,
          gravedad_evento: gravedad,
        }),
      });

      if (!res.ok) {
        const cuerpo = await res.json().catch(() => null);
        if (res.status === 403)
          throw new Error("No tienes permisos para escribir notas (solo psiquiatras y enfermeras).");
        if (res.status === 409)
          throw new Error("No se puede escribir una nota en un ingreso cerrado.");
        throw new Error(textoDeError(cuerpo?.detail, "Error al guardar la nota."));
      }

      setContenido("");
      await buscarNotas();
      setExito("Nota guardada con éxito.");
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor."
          : err instanceof Error
          ? err.message
          : "Error al guardar la nota."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <header>
        <h1 className="text-3xl font-light text-slate-800">Notas clínicas</h1>
        <p className="mt-1 text-sm text-slate-500">Línea de tiempo de evolución por ingreso</p>
      </header>

      {/* Solo pruebas */}
      {SIMULAR_ROL && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <label htmlFor="rol-simulado" className="mb-1 block text-sm font-medium text-amber-900">
            Simulador de rol (solo pruebas)
          </label>
          <select
            id="rol-simulado"
            value={rolSimulado}
            onChange={(e) => setRolSimulado(e.target.value)}
            className={CAMPO + " max-w-xs"}
          >
            <option value="PSIQUIATRA">PSIQUIATRA (ID 1)</option>
            <option value="ENFERMERA">ENFERMERA (ID 2)</option>
            <option value="AUDITOR">AUDITOR (ID 99, no puede ver)</option>
          </select>
        </div>
      )}

      {/* Sin acceso */}
      {listo && !puedeUsar && (
        <div role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-slate-800">Tu rol no tiene acceso a las notas clínicas</p>
          <p className="mt-1 text-sm text-slate-500">
            Solo el personal de psiquiatría y enfermería puede consultarlas y escribirlas.
          </p>
        </div>
      )}

      {listo && puedeUsar && (
        <>
          {/* Búsqueda */}
          <form
            onSubmit={buscarNotas}
            className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="w-40">
              <label htmlFor="id-ingreso" className={ETIQUETA}>
                Número de ingreso
              </label>
              <input
                id="id-ingreso"
                type="number"
                min={1}
                required
                value={idIngreso}
                onChange={(e) => setIdIngreso(e.target.value)}
                className={CAMPO}
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="rounded-lg bg-[#0B7A86] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#096570] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? "Buscando..." : "Buscar notas"}
            </button>
          </form>

          {/* Mensajes */}
          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}
          {exito && (
            <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {exito}
            </p>
          )}

          {/* Nueva nota */}
          <form onSubmit={guardarNota} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Agregar nueva nota</h2>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="tipo-nota" className={ETIQUETA}>
                  Tipo de nota
                </label>
                <select id="tipo-nota" value={tipoNota} onChange={(e) => setTipoNota(e.target.value)} className={CAMPO}>
                  <option value="Evolución">Evolución</option>
                  <option value="Interconsulta">Interconsulta</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
              <div>
                <label htmlFor="gravedad" className={ETIQUETA}>
                  Gravedad del evento
                </label>
                <select id="gravedad" value={gravedad} onChange={(e) => setGravedad(e.target.value)} className={CAMPO}>
                  <option value="Leve">Leve</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Grave">Grave</option>
                </select>
              </div>
            </div>
            <label htmlFor="contenido" className={ETIQUETA}>
              Contenido
            </label>
            <textarea
              id="contenido"
              placeholder="Escriba el contenido de la nota clínica..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
              className={CAMPO + " mb-4 h-28"}
            />
            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-[#1E4E8C] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#183f72] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar nota"}
            </button>
          </form>

          {/* Línea de tiempo */}
          <section aria-labelledby="titulo-timeline">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="titulo-timeline" className="text-lg font-semibold text-slate-800">
                Línea de tiempo
              </h2>
              {buscado && !cargando && (
                <p className="text-sm text-slate-500">
                  {notas.length} {notas.length === 1 ? "nota" : "notas"}
                </p>
              )}
            </div>

            {cargando ? (
              <div className="space-y-4" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
                ))}
              </div>
            ) : !buscado ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                Ingresa un número de ingreso y pulsa «Buscar notas».
              </p>
            ) : notas.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                Este ingreso todavía no tiene notas registradas.
              </p>
            ) : (
              <ol className="relative ml-3 space-y-5 border-l-2 border-[#0B7A86]/30 pl-8">
                {notas.map((n) => (
                  <li key={n.id_nota} className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[2.6rem] top-6 h-4 w-4 rounded-full border-4 border-white bg-[#0B7A86] ring-1 ring-[#0B7A86]/40"
                    />
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
                          {n.tipo_nota}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            ESTILO_GRAVEDAD[n.gravedad_evento ?? ""] ?? "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {n.gravedad_evento ?? "Sin gravedad"}
                        </span>
                      </div>
                      <time dateTime={n.fecha_hora} className="text-sm text-slate-500">
                        {new Date(n.fecha_hora).toLocaleString("es-MX", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-slate-800">{n.contenido}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      Registrada por el profesional #{n.id_profesional}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  );
}