"use client";

import { useEffect, useState } from "react";

type Medicamento = {
  id_medicamento: number;
  nombre_generico: string;
  presentacion: string;
  stock_actual: number;
};

export default function FarmaciaPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [idIngreso, setIdIngreso] = useState("");
  const [idMedicamento, setIdMedicamento] = useState("");
  const [cantidad, setCantidad] = useState("");

  const [requiereJustificacion, setRequiereJustificacion] = useState(false);
  const [justificacion, setJustificacion] = useState("");
  const [autorizadoPor, setAutorizadoPor] = useState("");

  // TODO: Cambiar por process.env.NEXT_PUBLIC_API_URL
  const cargarMedicamentos = () => {
    fetch("http://127.0.0.1:8000/farmacia/")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMedicamentos(data);
        setCargando(false);
      })
      .catch(() => {
        setError("Error al conectar con la API");
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const handlePrescribir = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    if (!idIngreso || !idMedicamento || !cantidad) {
      setError("Por favor, llene todos los campos.");
      return;
    }

    const nuevaPrescripcion = {
      id_ingreso: parseInt(idIngreso),
      id_medicamento: parseInt(idMedicamento),
      id_psiquiatra: 1,
      dosis_cantidad: parseFloat(cantidad),
      dosis_unidad: "mg",
      frecuencia_horas: 24,
      via_administracion: "Oral",
      fecha_inicio: new Date().toISOString().split('T')[0],
      justificacion_exceso: requiereJustificacion ? justificacion : null,
      autorizado_por: requiereJustificacion ? parseInt(autorizadoPor) : null
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/farmacia/prescribir/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaPrescripcion),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.detail.includes("LÍMITE EXCEDIDO")) {
          setRequiereJustificacion(true);
        }
        throw new Error(data.detail || "Error al prescribir");
      }

      setMensaje(`Prescripción creada exitosamente (ID: ${data.id})`);
      setRequiereJustificacion(false);
      setJustificacion("");
      setAutorizadoPor("");
      setIdIngreso("");
      setIdMedicamento("");
      setCantidad("");
    } catch (err: any) {
      setError(`❌ ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 p-8 bg-hospital-fondo min-h-screen">
      <header>
        <h1 className="text-3xl font-light text-slate-800">Módulo de Farmacia</h1>
        <p className="mt-1 text-sm text-slate-500">Control de prescripciones e inventario</p>
      </header>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recetar Medicamento</h2>
        <form onSubmit={handlePrescribir} className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">ID Ingreso</label>
              <input type="number" value={idIngreso} onChange={(e) => setIdIngreso(e.target.value)} placeholder="Ej. 1" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-hospital-secundario focus:outline-none focus:ring-2 focus:ring-hospital-secundario/40 w-28" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">ID Medicamento</label>
              <input type="number" value={idMedicamento} onChange={(e) => setIdMedicamento(e.target.value)} placeholder="Ej. 2" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-hospital-secundario focus:outline-none focus:ring-2 focus:ring-hospital-secundario/40 w-28" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Dosis (mg)</label>
              <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Ej. 50" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-hospital-secundario focus:outline-none focus:ring-2 focus:ring-hospital-secundario/40 w-28" />
            </div>
            <button type="submit" className="rounded-lg bg-hospital-secundario px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-800">
              {requiereJustificacion ? "Autorizar y Prescribir" : "Prescribir"}
            </button>
          </div>

          {/* Panel Rojo de Justificación (Polifarmacia) */}
          {requiereJustificacion && (
            <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg mt-4">
              <p className="text-sm text-red-800 font-bold mb-3">⚠️ Límite excedido (Polifarmacia)</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-red-700 mb-1">Justificación Médica Obligatoria</label>
                  <textarea value={justificacion} onChange={(e) => setJustificacion(e.target.value)} className="w-full rounded-lg border border-red-300 p-2 text-sm text-slate-800 focus:outline-none focus:border-red-500" rows={2} placeholder="Explique por qué receta un tercer fármaco..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-red-700 mb-1">ID Psiquiatra Autorizador</label>
                  <input type="number" value={autorizadoPor} onChange={(e) => setAutorizadoPor(e.target.value)} className="w-full rounded-lg border border-red-300 p-2 text-sm text-slate-800 focus:outline-none focus:border-red-500" placeholder="Ej. 1" />
                </div>
              </div>
            </div>
          )}
        </form>

        {mensaje && <p className="mt-4 text-emerald-700 font-medium p-3 bg-emerald-50 border border-emerald-200 rounded-lg">{mensaje}</p>}
        {error && !requiereJustificacion && <p className="mt-4 text-red-700 font-medium p-3 bg-red-50 border border-red-200 rounded-lg">{error}</p>}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">ID</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Nombre Genérico</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Presentación</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargando ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Cargando inventario...</td></tr>
            ) : (
              medicamentos.map((med) => (
                <tr key={med.id_medicamento} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-800">{med.id_medicamento}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{med.nombre_generico}</td>
                  <td className="px-6 py-4 text-slate-600">{med.presentacion}</td>
                  <td className="px-6 py-4 text-slate-600">{med.stock_actual}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}