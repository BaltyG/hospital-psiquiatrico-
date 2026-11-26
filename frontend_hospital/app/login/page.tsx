"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../pacientes/datosApi";
import { guardarSesion, Sesion } from "../lib/sesion";


function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <p className="text-3xl font-bold tracking-tight">
      <span className={claro ? "text-sky-200" : "text-[#1E4E8C]"}>HOSPITAL</span>
      <span className={claro ? "text-white" : "text-slate-800"}>SYS</span>
    </p>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ingresar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const cuerpo = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          typeof cuerpo?.detail === "string"
            ? cuerpo.detail
            : "No se pudo iniciar sesión. Revisa los datos e inténtalo de nuevo."
        );
        setPassword("");
        return;
      }

      guardarSesion(cuerpo as Sesion);
      router.push("/");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    // TEMPORAL: "fixed inset-0" cubre el sidebar del layout actual.
    // En el siguiente paso se mueve el sidebar a un grupo de rutas y esto se simplifica.
    <main className="flex min-h-screen overflow-y-auto bg-slate-50">
      {/* Panel izquierdo */}
      <section className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1E4E8C] to-[#0B7A86] p-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 rounded-full border border-white/10"
        />

        <Logo claro />

        <div className="relative">
          <h1 className="text-4xl font-semibold leading-tight">
            Gestión clínica y control de polifarmacia
          </h1>
          <p className="mt-4 max-w-sm text-sky-100">
            Plataforma para el personal médico y de auditoría del hospital psiquiátrico.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-sky-100">
            <li>Trazabilidad clínica de cada ingreso</li>
            <li>Alertas de interacciones y exceso de medicamentos</li>
            <li>Auditoría de cada acción en el sistema</li>
          </ul>
        </div>

        <p className="relative text-xs text-sky-200">Sistema v1.0</p>
      </section>

      {/* Panel derecho */}
      <section className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-800">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ingresa con tu usuario del sistema.
            </p>

            <form onSubmit={ingresar} className="mt-6 space-y-5">
              <div>
                <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-[#0B7A86] focus:outline-none focus:ring-2 focus:ring-[#0B7A86]/40"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={verPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-20 text-slate-800 focus:border-[#0B7A86] focus:outline-none focus:ring-2 focus:ring-[#0B7A86]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    aria-pressed={verPassword}
                    className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-[#1E4E8C] hover:underline"
                  >
                    {verPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando || !username || !password}
                className="w-full rounded-lg bg-[#0B7A86] px-4 py-2.5 font-medium text-white hover:bg-[#096570] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cargando ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Acceso restringido a personal autorizado. Toda la actividad queda
            registrada en auditoría.
          </p>
          <p className="mt-2 text-center text-xs text-slate-500">
            ¿Problemas de acceso? Contacta a soporte TI.
          </p>
        </div>
      </section>
    </main>
  );
}