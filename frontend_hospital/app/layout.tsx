import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hospital Psiquiátrico | Sistema de Gestión",
  description: "Plataforma modular para el control clínico y administrativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex h-screen bg-gray-50 text-gray-800 overflow-hidden`}>
        
        {/* SIDEBAR IZQUIERDO */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-10">
          {/* Logo / Encabezado */}
          <div className="h-16 flex items-center justify-center border-b border-slate-800 bg-slate-950">
            <h1 className="text-lg font-bold text-white tracking-wider">
              🏥 Hospital Psiquiátrico
            </h1>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            <Link 
              href="/pacientes" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors duration-200"
            >
              <span>👥</span> Pacientes
            </Link>
            <Link 
              href="/farmacia" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors duration-200"
            >
              <span>💊</span> Farmacia
            </Link>
            <Link 
              href="/diagnosticos" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors duration-200"
            >
              <span>📋</span> Diagnósticos
            </Link>
            <Link 
              href="/auditoria" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors duration-200"
            >
              <span>🔍</span> Auditoría
            </Link>
          </nav>

          {/* Footer del Sidebar */}
          <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-500">
            Sistema Modular v1.0 <br />
            Arquitectura Backend
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL (A la derecha) */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Barra superior (Header) */}
          <header className="h-16 bg-white shadow-sm flex items-center px-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-slate-800">
              Panel Clínico
            </h2>
          </header>
          
          {/* Aquí se renderizan las páginas (pacientes, farmacia, etc.) */}
          <div className="flex-1 overflow-y-auto p-8">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}