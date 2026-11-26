"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { leerSesion, cerrarSesion, Sesion } from "./lib/sesion";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sesionActual = leerSesion();
    setSesion(sesionActual);
    if (!sesionActual && pathname !== "/login") {
      router.push("/login");
    }
    setCargando(false);
  }, [pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (cargando || !sesion) return null;

  const rolActual = String(sesion.rol).toUpperCase();
  const puedeVerAuditoria = rolActual === "AUDITOR" || rolActual === "ADMIN";

  const linkClass = (href: string) => {
    const activo = pathname === href;
    return `block px-4 py-2 rounded-lg transition-colors ${
      activo
        ? "bg-white/15 font-medium text-white shadow-xs"
        : "text-sky-100 hover:bg-white/10 hover:text-white"
    }`;
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-[#1E4E8C] text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-sky-200">
            HOSPITAL<span className="text-white">SYS</span>
          </h1>
          <p className="text-xs text-sky-200 mt-1">Panel Clínico</p>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <Link href="/" className={linkClass("/")}>Inicio</Link>
          <Link href="/pacientes" className={linkClass("/pacientes")}>Pacientes</Link>
          <Link href="/farmacia" className={linkClass("/farmacia")}>Farmacia</Link>
          <Link href="/diagnosticos" className={linkClass("/diagnosticos")}>Diagnósticos</Link>
          {puedeVerAuditoria && (
            <Link href="/auditoria" className={linkClass("/auditoria")}>Auditoría</Link>
          )}
          <Link href="/notas" className={linkClass("/notas")}>Notas Clínicas</Link>
        </nav>

        <div className="p-4 border-t border-white/10 text-sm">
          <p className="font-medium text-white">{sesion.nombre_completo}</p>
          <p className="text-xs text-sky-200 mb-3">{sesion.rol}</p>
          <button
            onClick={() => {
              cerrarSesion();
              router.push("/login");
            }}
            className="w-full text-left text-xs text-red-300 hover:text-red-100"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}