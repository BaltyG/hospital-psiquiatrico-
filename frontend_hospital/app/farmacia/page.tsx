"use client";

import { useEffect, useState } from "react";
import { API_URL, headersAdmin } from "../pacientes/datosApi";
import { leerSesion } from "../lib/sesion";

type Medicamento = {
  id_medicamento: number;
  nombre_generico: string;
  nombre_comercial?: string | null;
  grupo_farmacologico: string;
  presentacion: string;
  stock_actual: number;
};

type IngresoActivo = {
  id_ingreso: number;
  expediente: string;
  nombre_paciente: string;
};

type Psiquiatra = {
  id_profesional: number;
  nombre_completo: string;
};

type PrescripcionActiva = {
  id_prescripcion: number;
  dosis_cantidad: number;
  dosis_unidad: string;
  frecuencia_horas: number;
  via_administracion: string;
  id_medicamento: number;
  nombre_generico: string;
  presentacion: string;
  grupo_farmacologico: string;
};

export default function FarmaciaPage() {
  const [esPsiquiatra, setEsPsiquiatra] = useState(false);
  const [idProfesionalActual, setIdProfesionalActual] = useState<number | null>(null);

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [ingresos, setIngresos] = useState<IngresoActivo[]>([]);
  const [psiquiatras, setPsiquiatras] = useState<Psiquiatra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Filtro rápido del catálogo
  const [busquedaMed, setBusquedaMed] = useState("");

  // Estados del formulario clínico
  const [idIngreso, setIdIngreso] = useState("");
  const [idMedicamento, setIdMedicamento] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("mg");
  const [frecuencia, setFrecuencia] = useState("24");
  const [via, setVia] = useState("Oral");
  const [fechaInicio, setFechaInicio] = useState(() => new Date().toISOString().split("T")[0]);
  const [fechaFin, setFechaFin] = useState("");

  // Estado de prescripciones activas del ingreso seleccionado
  const [activasIngreso, setActivasIngreso] = useState<PrescripcionActiva[]>([]);
  const [cargandoActivas, setCargandoActivas] = useState(false);

  // Estados del Modal de Override (Polifarmacia)
  const [modalOverrideAbierto, setModalOverrideAbierto] = useState(false);
  const [justificacion, setJustificacion] = useState("");
  const [autorizadoPor, setAutorizadoPor] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cargarDatosIniciales = async (puedePrescribir: boolean) => {
    try {
      const resMeds = await fetch(`${API_URL}/farmacia/`);
      const dataMeds = await resMeds.json();
      if (Array.isArray(dataMeds)) setMedicamentos(dataMeds);

      // Solo consultamos ingresos y psiquiatras si el usuario tiene rol PSIQUIATRA
      if (puedePrescribir) {
        const [resIngresos, resPsiq] = await Promise.all([
          fetch(`${API_URL}/farmacia/ingresos-activos/`),
          fetch(`${API_URL}/farmacia/psiquiatras/`),
        ]);
        const dataIngresos = await resIngresos.json();
        const dataPsiq = await resPsiq.json();

        if (Array.isArray(dataIngresos)) setIngresos(dataIngresos);
        if (Array.isArray(dataPsiq)) setPsiquiatras(dataPsiq);
      }
    } catch {
      setError("Error al conectar con la API de Farmacia.");
    } finally {
      setCargando(false);
    }
  };

  const cargarActivasDeIngreso = async (ingresoId: string) => {
    if (!ingresoId) {
      setActivasIngreso([]);
      return;
    }
    setCargandoActivas(true);
    try {
      const res = await fetch(`${API_URL}/farmacia/prescripciones/${ingresoId}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.prescripciones)) {
        setActivasIngreso(data.prescripciones);
      } else {
        setActivasIngreso([]);
      }
    } catch {
      setActivasIngreso([]);
    } finally {
      setCargandoActivas(false);
    }
  };

  useEffect(() => {
    const sesion = leerSesion();
    const rolEsPsiquiatra = Boolean(sesion && String(sesion.rol).toUpperCase() === "PSIQUIATRA");
    setEsPsiquiatra(rolEsPsiquiatra);
    setIdProfesionalActual(sesion ? sesion.id_profesional : null);

    cargarDatosIniciales(rolEsPsiquiatra);
  }, []);

  const handleSeleccionarIngreso = (nuevoIdIngreso: string) => {
    setIdIngreso(nuevoIdIngreso);
    setError(null);
    setMensaje(null);
    cargarActivasDeIngreso(nuevoIdIngreso);
  };

  const enviarPrescripcion = async (conAutorizacion: boolean) => {
    setMensaje(null);
    setError(null);
    setEnviando(true);

    const payload = {
      id_ingreso: parseInt(idIngreso, 10),
      id_medicamento: parseInt(idMedicamento, 10),
      id_psiquiatra: idProfesionalActual,
      dosis_cantidad: parseFloat(cantidad),
      dosis_unidad: unidad,
      frecuencia_horas: parseInt(frecuencia, 10),
      via_administracion: via,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin ? fechaFin : null,
      justificacion_exceso: conAutorizacion ? justificacion.trim() : null,
      autorizado_por: conAutorizacion && autorizadoPor ? parseInt(autorizadoPor, 10) : null,
    };

    try {
      const response = await fetch(`${API_URL}/farmacia/prescribir/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headersAdmin(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && typeof data.detail === "string" && data.detail.includes("LÍMITE EXCEDIDO")) {
          setModalOverrideAbierto(true);
          setEnviando(false);
          return;
        }
        throw new Error(data.detail || "Error al registrar la prescripción.");
      }

      setMensaje(`Prescripción registrada exitosamente (Folio #${data.id}).`);
      setModalOverrideAbierto(false);
      setJustificacion("");
      setAutorizadoPor("");
      setIdMedicamento("");
      setCantidad("");
      setFechaFin("");

      await Promise.all([cargarDatosIniciales(true), cargarActivasDeIngreso(idIngreso)]);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setEnviando(false);
    }
  };

  const handleSubmitFormulario = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    if (!idIngreso || !idMedicamento || !cantidad || parseFloat(cantidad) <= 0) {
      setError("Seleccione un ingreso, un medicamento e indique una dosis válida.");
      return;
    }

    if (activasIngreso.length >= 2) {
      setModalOverrideAbierto(true);
      return;
    }

    enviarPrescripcion(false);
  };

  const handleConfirmarOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificacion.trim() || !autorizadoPor) {
      setError("Debe ingresar la justificación médica y seleccionar al psiquiatra autorizador.");
      return;
    }
    enviarPrescripcion(true);
  };

  const ingresoSeleccionado = ingresos.find((i) => String(i.id_ingreso) === idIngreso);
  const medicamentoSeleccionado = medicamentos.find((m) => String(m.id_medicamento) === idMedicamento);
  const excedeLimite = activasIngreso.length >= 2;

  const medicamentosFiltrados = medicamentos.filter((m) => {
    const q = busquedaMed.toLowerCase();
    return (
      m.nombre_generico.toLowerCase().includes(q) ||
      m.grupo_farmacologico.toLowerCase().includes(q) ||
      m.presentacion.toLowerCase().includes(q)
    );
  });

  const badgeGrupo = (grupo: string) => {
    const g = grupo.toLowerCase();
    if (g.includes("antidepresivo")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (g.includes("antipsicótico") || g.includes("antipsicotico")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (g.includes("ansiolítico") || g.includes("ansiolitico") || g.includes("benzodiacepina")) return "bg-amber-50 text-amber-800 border-amber-200";
    if (g.includes("estabilizador")) return "bg-teal-50 text-teal-800 border-teal-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6 p-8">
      {/* Encabezado Unificado */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-slate-800">Módulo de Farmacia</h1>
          <p className="mt-1 text-sm text-slate-500">
            {esPsiquiatra
              ? "Control de prescripciones clínicas, inventario y vigilancia de polifarmacia"
              : "Consulta de catálogo farmacológico y disponibilidad en inventario"}
          </p>
        </div>
      </header>

      {/* Formulario de Prescripción: visible ÚNICAMENTE si el rol en sesión es PSIQUIATRA */}
      {esPsiquiatra && (
        <section className="rounded-xl border border-slate-200 border-l-4 border-l-[#0B7A86] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-semibold text-slate-800">Recetar medicamento</h2>

            {idIngreso && (
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border ${
                  excedeLimite
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                <span>Psicofármacos activos en este ingreso:</span>
                <span className={`font-bold ${excedeLimite ? "text-amber-700" : "text-[#0B7A86]"}`}>
                  {cargandoActivas ? "..." : `${activasIngreso.length} de 2`}
                </span>
                {excedeLimite && (
                  <span className="ml-1 rounded bg-amber-200/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-950">
                    Requiere autorización
                  </span>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmitFormulario} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Ingreso / Paciente activo
                </label>
                <select
                  value={idIngreso}
                  onChange={(e) => handleSeleccionarIngreso(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
                >
                  <option value="">Seleccione un paciente ingresado...</option>
                  {ingresos.map((ing) => (
                    <option key={ing.id_ingreso} value={ing.id_ingreso}>
                      #{ing.id_ingreso} · {ing.expediente} · {ing.nombre_paciente}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Medicamento
                </label>
                <select
                  value={idMedicamento}
                  onChange={(e) => setIdMedicamento(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
                >
                  <option value="">Seleccione medicamento del catálogo...</option>
                  {medicamentos.map((med) => (
                    <option
                      key={med.id_medicamento}
                      value={med.id_medicamento}
                      disabled={med.stock_actual <= 0}
                    >
                      {med.nombre_generico} · {med.presentacion} ({med.grupo_farmacologico}) — Stock: {med.stock_actual}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Dosis
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ej. 50"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Unidad
                </label>
                <select
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
                >
                  <option value="mg">mg</option>
                  <option value="ml">ml</option>
                  <option value="tableta">tableta(s)</option>
                  <option value="cápsula">cápsula(s)</option>
                  <option value="gotas">gotas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Frecuencia
                </label>
                <select
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
                >
                  <option value="6">Cada 6 horas</option>
                  <option value="8">Cada 8 horas</option>
                  <option value="12">Cada 12 horas</option>
                  <option value="24">Cada 24 horas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Vía
                </label>
                <select
                  value={via}
                  onChange={(e) => setVia(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
                >
                  <option value="Oral">Oral</option>
                  <option value="Intramuscular">Intramuscular</option>
                  <option value="Intravenosa">Intravenosa</option>
                  <option value="Sublingual">Sublingual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Fecha fin (opc.)
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  min={fechaInicio}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="text-sm text-slate-600">
                {ingresoSeleccionado && medicamentoSeleccionado && cantidad ? (
                  <span>
                    Resumen:{" "}
                    <strong className="text-slate-900">
                      {medicamentoSeleccionado.nombre_generico} ({medicamentoSeleccionado.presentacion})
                    </strong>{" "}
                    · {cantidad} {unidad} cada {frecuencia}h ({via}) para{" "}
                    <strong className="font-mono text-[#1E4E8C]">{ingresoSeleccionado.expediente}</strong>{" "}
                    ({ingresoSeleccionado.nombre_paciente})
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Complete los campos para previsualizar la orden médica.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="rounded-lg bg-[#0B7A86] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#096570] disabled:opacity-50 transition-colors"
              >
                {enviando
                  ? "Procesando..."
                  : excedeLimite
                  ? "Continuar con Autorización"
                  : "Prescribir"}
              </button>
            </div>
          </form>

          {mensaje && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
              {mensaje}
            </div>
          )}
          {error && !modalOverrideAbierto && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
        </section>
      )}

      {/* Catálogo de Medicamentos (Visible para todos los roles autorizados) */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Catálogo de Medicamentos</h2>
            <p className="text-xs text-slate-500">
              Mostrando {medicamentosFiltrados.length} de {medicamentos.length} medicamentos
            </p>
          </div>
          <input
            type="text"
            value={busquedaMed}
            onChange={(e) => setBusquedaMed(e.target.value)}
            placeholder="Buscar fármaco o grupo..."
            className="w-full sm:w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Nombre Genérico
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Grupo Farmacológico
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Presentación
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Cargando inventario...
                  </td>
                </tr>
              ) : medicamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron medicamentos con ese criterio.
                  </td>
                </tr>
              ) : (
                medicamentosFiltrados.map((med) => {
                  const stockBajo = med.stock_actual > 0 && med.stock_actual < 20;
                  const sinStock = med.stock_actual <= 0;

                  return (
                    <tr
                      key={med.id_medicamento}
                      className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-slate-600">{med.id_medicamento}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{med.nombre_generico}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeGrupo(
                            med.grupo_farmacologico
                          )}`}
                        >
                          {med.grupo_farmacologico}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{med.presentacion}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            sinStock
                              ? "bg-red-100 text-red-800"
                              : stockBajo
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {sinStock
                            ? "Agotado (0)"
                            : stockBajo
                            ? `Stock bajo: ${med.stock_actual} u.`
                            : `${med.stock_actual} unidades`}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de Excepción de Polifarmacia (Override) - Solo si esPsiquiatra */}
      {esPsiquiatra && modalOverrideAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                  Alerta Clínica · Polifarmacia
                </span>
                <h3 className="mt-1.5 text-lg font-semibold text-slate-900">
                  Autorización por exceso de psicofármacos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOverrideAbierto(false);
                  setError(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-sm text-slate-600">
                El ingreso{" "}
                <strong className="font-mono text-slate-800">
                  #{ingresoSeleccionado?.id_ingreso} ({ingresoSeleccionado?.expediente})
                </strong>{" "}
                ya cuenta con <strong>{activasIngreso.length} medicamentos activos</strong>. Para agregar{" "}
                <strong>{medicamentoSeleccionado?.nombre_generico}</strong>, documente la justificación clínica:
              </p>

              {activasIngreso.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Tratamiento activo actual
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {activasIngreso.map((act) => (
                      <li key={act.id_prescripcion} className="flex items-center justify-between">
                        <span>
                          <strong>{act.nombre_generico}</strong> ({act.presentacion}) — {act.dosis_cantidad}{" "}
                          {act.dosis_unidad} c/{act.frecuencia_horas}h
                        </span>
                        <span className="rounded bg-white px-2 py-0.5 text-[11px] text-slate-600 border border-slate-200">
                          {act.grupo_farmacologico}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleConfirmarOverride} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Justificación Médica Obligatoria
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={justificacion}
                    onChange={(e) => setJustificacion(e.target.value)}
                    placeholder="Indique el criterio clínico que justifica la terapia combinada..."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Psiquiatra Autorizador
                  </label>
                  <select
                    required
                    value={autorizadoPor}
                    onChange={(e) => setAutorizadoPor(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0B7A86] focus:ring-2 focus:ring-[#0B7A86]/30 outline-none"
                  >
                    <option value="">Seleccione médico que autoriza...</option>
                    {psiquiatras.map((psiq) => (
                      <option key={psiq.id_profesional} value={psiq.id_profesional}>
                        Dr(a). {psiq.nombre_completo} (ID #{psiq.id_profesional})
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOverrideAbierto(false);
                      setError(null);
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando}
                    className="rounded-lg bg-[#0B7A86] px-4 py-2 text-sm font-medium text-white hover:bg-[#096570] disabled:opacity-50"
                  >
                    {enviando ? "Autorizando..." : "Autorizar y Prescribir"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}