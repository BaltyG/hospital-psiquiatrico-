"use client";

import { FormEvent, useRef, useState } from "react";
import { API_URL, headersAdmin } from "./datosApi";

type ErrorFila = { fila: number; detalle: string };
type ResultadoImportacion = {
  archivo: string;
  destino: string;
  filas_leidas: number;
  filas_importadas: number;
  filas_rechazadas: number;
  errores: ErrorFila[];
};
type ErrorImportacion = { mensaje: string; errores: ErrorFila[] };

function ListaErrores({ errores }: { errores: ErrorFila[] }) {
  if (errores.length === 0) return null;
  return (
    <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-y-auto pl-5 text-sm text-red-700">
      {errores.map((e, i) => (
        <li key={`${e.fila}-${i}`}>
          <span className="font-medium">Línea {e.fila}:</span> {e.detalle}
        </li>
      ))}
    </ul>
  );
}

export default function ImportarCsvButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [estricto, setEstricto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [error, setError] = useState<ErrorImportacion | null>(null);

  async function importar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!archivo) return;

    setCargando(true);
    setResultado(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("archivo", archivo);

      const url = `${API_URL}/datos/importar/paciente${estricto ? "?estricto=true" : ""}`;

      const res = await fetch(url, {
        method: "POST",
        headers: headersAdmin(),
        body: formData,
      });
      const cuerpo = await res.json().catch(() => null);

      if (!res.ok) {
        const detail = cuerpo?.detail;
        if (typeof detail === "string") {
          setError({ mensaje: detail, errores: [] });
        } else if (detail?.mensaje) {
          setError({ mensaje: detail.mensaje, errores: detail.errores ?? [] });
        } else {
          setError({ mensaje: `Error ${res.status} al importar.`, errores: [] });
        }
        return;
      }

      setResultado(cuerpo as ResultadoImportacion);
      setArchivo(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError({ mensaje: "No se pudo conectar con el servidor.", errores: [] });
    } finally {
      setCargando(false);
    }
  }

  const hayRechazos = resultado !== null && resultado.filas_rechazadas > 0;

  return (
    <div className="flex max-w-xl flex-col gap-3">
      <form onSubmit={importar} className="flex flex-col gap-3">
        <label htmlFor="archivo-csv" className="text-sm font-medium text-slate-700">
          Importar pacientes desde CSV
        </label>
        <input
          ref={inputRef}
          id="archivo-csv"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-300"
        />

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={estricto}
            onChange={(e) => setEstricto(e.target.checked)}
          />
          Modo estricto (si hay una fila inválida, no se importa nada)
        </label>

        <button
          type="submit"
          disabled={!archivo || cargando}
          className="w-fit rounded-md bg-[#0B7A86] px-4 py-2 text-sm font-medium text-white hover:bg-[#096570] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando ? "Importando..." : "Importar CSV"}
        </button>
      </form>

      {error && (
        <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800">
          <p className="text-sm font-medium">{error.mensaje}</p>
          <ListaErrores errores={error.errores} />
        </div>
      )}

      {resultado && (
        <div
          role="status"
          className={`rounded-md border p-3 ${
            hayRechazos
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-emerald-300 bg-emerald-50 text-emerald-900"
          }`}
        >
          <p className="text-sm font-medium">
            {resultado.filas_importadas} de {resultado.filas_leidas} filas importadas desde «{resultado.archivo}» ({resultado.destino}).
          </p>
          {hayRechazos && (
            <>
              <p className="mt-2 text-sm font-medium">
                {resultado.filas_rechazadas} fila(s) rechazada(s):
              </p>
              <ListaErrores errores={resultado.errores} />
            </>
          )}
        </div>
      )}
    </div>
  );
}