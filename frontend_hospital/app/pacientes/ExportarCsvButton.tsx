"use client";

import { useState } from "react";
import { API_URL, headersAdmin } from "./datosApi";

export default function ExportarCsvButton() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exportar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/datos/exportar/paciente`, {
        headers: headersAdmin(),
      });

      if (!res.ok) {
        const cuerpo = await res.json().catch(() => null);
        throw new Error(
          typeof cuerpo?.detail === "string"
            ? cuerpo.detail
            : `Error ${res.status} al exportar.`
        );
      }

      const disposicion = res.headers.get("Content-Disposition") ?? "";
      const coincidencia = /filename="?([^";]+)"?/i.exec(disposicion);
      const nombre = coincidencia?.[1] ?? "pacientes.csv";

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado al exportar.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={exportar}
        disabled={cargando}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cargando ? "Exportando..." : "Exportar a CSV"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}