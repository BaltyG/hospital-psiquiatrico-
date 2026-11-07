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

  // Estados del formulario (inician vacíos)
  const [idIngreso, setIdIngreso] = useState("");
  const [idMedicamento, setIdMedicamento] = useState("");
  const [cantidad, setCantidad] = useState("");

  // Estados para el Override (solo se activan si hay polifarmacia)
  const [requiereJustificacion, setRequiereJustificacion] = useState(false);
  const [justificacion, setJustificacion] = useState("");
  const [autorizadoPor, setAutorizadoPor] = useState("");

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
      // Si requiereJustificacion es TRUE, manda los datos. Si es FALSE, manda null.
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
        // Si el error es de polifarmacia, activamos el panel rojo
        if (response.status === 400 && data.detail.includes("LÍMITE EXCEDIDO")) {
          setRequiereJustificacion(true);
        }
        throw new Error(data.detail || "Error al prescribir");
      }

      setMensaje(`Prescripción creada exitosamente (ID: ${data.id})`);
      // Limpiamos todo tras el éxito
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
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Módulo de Farmacia</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recetar Medicamento</h2>
          <form onSubmit={handlePrescribir} className="space-y-4">
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ID Ingreso</label>
                <input type="number" value={idIngreso} onChange={(e) => setIdIngreso(e.target.value)} placeholder="Ej. 1" className="border p-2 rounded w-24 text-black" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ID Medicamento</label>
                <input type="number" value={idMedicamento} onChange={(e) => setIdMedicamento(e.target.value)} placeholder="Ej. 2" className="border p-2 rounded w-24 text-black" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dosis (mg)</label>
                <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Ej. 50" className="border p-2 rounded w-24 text-black" />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 h-10">
                {requiereJustificacion ? "Autorizar y Prescribir" : "Prescribir"}
              </button>
            </div>

            {/* Panel Rojo de Justificación */}
            {requiereJustificacion && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mt-4">
                <p className="text-sm text-red-700 font-bold mb-3">⚠️ Límite excedido (Polifarmacia)</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-red-700 mb-1">Justificación Médica Obligatoria</label>
                    <textarea value={justificacion} onChange={(e) => setJustificacion(e.target.value)} className="w-full border-red-300 rounded p-2 text-sm border text-black" rows={2} placeholder="Explique por qué receta un tercer fármaco..."></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-red-700 mb-1">ID Psiquiatra Autorizador</label>
                    <input type="number" value={autorizadoPor} onChange={(e) => setAutorizadoPor(e.target.value)} className="w-full border-red-300 rounded p-2 text-sm border text-black" placeholder="Ej. 1" />
                  </div>
                </div>
              </div>
            )}
          </form>

          {mensaje && <p className="mt-4 text-green-600 font-medium p-3 bg-green-50 border border-green-200 rounded">{mensaje}</p>}
          {error && !requiereJustificacion && <p className="mt-4 text-red-600 font-medium p-3 bg-red-50 border border-red-200 rounded">{error}</p>}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left text-gray-800">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Nombre Genérico</th>
                <th className="p-3">Presentación</th>
                <th className="p-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={4} className="p-4 text-center">Cargando...</td></tr>
              ) : (
                medicamentos.map((med) => (
                  <tr key={med.id_medicamento} className="border-b hover:bg-gray-50">
                    <td className="p-3">{med.id_medicamento}</td>
                    <td className="p-3 font-medium">{med.nombre_generico}</td>
                    <td className="p-3">{med.presentacion}</td>
                    <td className="p-3">{med.stock_actual}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}