"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { leerSesion, cerrarSesion, Sesion } from "./lib/sesion";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Si estamos en login, sin menú
  if (pathname === "/login") {
    return (
      <html lang="es">
        <body className={inter.className}>{children}</body>
      </html>
    );
  }

  if (cargando) return null;
  if (!sesion) return null;

  return (
    <html lang="es">
      <body className={`${inter.className} flex h-screen bg-slate-50`}>
        
        <aside className="w-64 bg-[#1E4E8C] text-white flex flex-col shadow-xl">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold text-sky-200">HOSPITAL<span className="text-white">SYS</span></h1>
            <p className="text-xs text-sky-200 mt-1">Panel Clínico</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Inicio</Link>
            <Link href="/pacientes" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Pacientes</Link>
            <Link href="/farmacia" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Farmacia</Link>
            <Link href="/diagnosticos" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Diagnósticos</Link>
            <Link href="/auditoria" className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Auditoría</Link>
          </nav>

          <div className="p-4 border-t border-white/10 text-sm">
            <p className="font-medium text-white">{sesion.nombre_completo}</p>
            <p className="text-xs text-sky-200 mb-3">{sesion.rol}</p>
            <button 
              onClick={() => { cerrarSesion(); router.push("/login"); }}
              className="w-full text-left text-xs text-red-300 hover:text-red-100"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </body>
    </html>
  );
}