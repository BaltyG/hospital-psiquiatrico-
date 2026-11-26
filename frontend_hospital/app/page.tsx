"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  ClipboardList,
  Download,
  FilePlus2,
  LifeBuoy,
  Pill,
  ShieldCheck,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import { leerSesion, type Sesion } from "./lib/sesion";

export const unstable_instant = false;

type Severidad = "Baja" | "Media" | "Alta" | "Crítica";
type Acceso = { etiqueta: string; href: string; icono: LucideIcon };

/* ------------------------- Datos de ejemplo (TODO: Conectar a la API) ------------------------- */
const RESUMEN = [
  { etiqueta: "Pacientes ingresados", valor: 10, detalle: "Ingresos sin fecha de egreso", acento: "border-t-[#1E4E8C]", icono: Users, colorIcono: "text-[#1E4E8C] bg-[#1E4E8C]/10" },
  { etiqueta: "Alertas pendientes", valor: 4, detalle: "Por revisar", acento: "border-t-amber-500", icono: Bell, colorIcono: "text-amber-600 bg-amber-100" },
  { etiqueta: "Prescripciones activas", valor: 23, detalle: "En todos los ingresos", acento: "border-t-emerald-500", icono: Pill, colorIcono: "text-emerald-600 bg-emerald-100" },
  { etiqueta: "Excepciones de polifarmacia", valor: 2, detalle: "Con autorización vigente", acento: "border-t-[#0B7A86]", icono: ShieldCheck, colorIcono: "text-[#0B7A86] bg-[#0B7A86]/10" },
];

const ALERTAS: { id: number; expediente: string; tipo: string; severidad: Severidad; hace: string }[] = [
  { id: 1, expediente: "EXP-0001", tipo: "Exceso Medicamentos", severidad: "Crítica", hace: "hace 12 min" },
  { id: 2, expediente: "EXP-0004", tipo: "Interacción", severidad: "Alta", hace: "hace 1 h" },
  { id: 3, expediente: "EXP-0007", tipo: "Reacción Adversa", severidad: "Media", hace: "hace 3 h" },
  { id: 4, expediente: "EXP-0002", tipo: "Interacción", severidad: "Baja", hace: "ayer" },
];

const ACTIVIDAD = [
  { id: 1, texto: "Exportación de pacientes (READ)", quien: "Administrador", hora: "10:42" },
  { id: 2, texto: "Prescripción creada (INSERT)", quien: "Psiquiatra", hora: "10:15" },
  { id: 3, texto: "Alerta marcada como revisada (UPDATE)", quien: "Psiquiatra", hora: "09:58" },
  { id: 4, texto: "Administración registrada (INSERT)", quien: "Enfermería", hora: "09:30" },
];

const ESTILO_SEVERIDAD: Record<Severidad, string> = {
  Baja: "bg-slate-100 text-slate-700",
  Media: "bg-amber-100 text-amber-800",
  Alta: "bg-orange-100 text-orange-800",
  Crítica: "bg-red-100 text-red-800",
};

const MODULOS = [
  { titulo: "Directorio de Pacientes", texto: "Consulta y gestión de expedientes clínicos.", href: "/pacientes", icono: Users, borde: "border-t-[#1E4E8C]", chip: "bg-[#1E4E8C]/10 text-[#1E4E8C]" },
  { titulo: "Módulo de Farmacia", texto: "Control de prescripciones y polifarmacia.", href: "/farmacia", icono: Pill, borde: "border-t-emerald-500", chip: "bg-emerald-50 text-emerald-700" },
  { titulo: "Diagnósticos", texto: "Catálogo CIE-10 y diagnósticos por ingreso.", href: "/diagnosticos", icono: Stethoscope, borde: "border-t-[#0B7A86]", chip: "bg-[#0B7A86]/10 text-[#0B7A86]" },
  { titulo: "Auditoría del Sistema", texto: "Revisión de logs y trazabilidad.", href: "/auditoria", icono: ShieldCheck, borde: "border-t-purple-500", chip: "bg-purple-50 text-purple-700" },
];

const ACCESOS_GENERALES: Acceso[] = [
  { etiqueta: "Pacientes", href: "/pacientes", icono: Users },
  { etiqueta: "Alertas y auditoría", href: "/auditoria", icono: Bell },
];

const ACCESOS_POR_ROL: Record<string, Acceso[]> = {
  PSIQUIATRA: [{ etiqueta: "Nueva prescripción", href: "/farmacia", icono: FilePlus2 }, { etiqueta: "Revisar alertas", href: "/auditoria", icono: Bell }],
  ENFERMERA: [{ etiqueta: "Registrar administración", href: "/farmacia", icono: ClipboardList }],
  AUDITOR: [{ etiqueta: "Revisar auditoría", href: "/auditoria", icono: ShieldCheck }],
  ADMIN: [{ etiqueta: "Exportar datos", href: "/pacientes", icono: Download }],
};

const NOMBRE_ROL: Record<string, string> = {
  PSIQUIATRA: "Psiquiatra", ENFERMERA: "Enfermería", PSICOLOGO: "Psicología", AUDITOR: "Auditoría", ADMIN: "Administración",
};

const FOCO = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7A86]";

export default function Home() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [saludo, setSaludo] = useState("Bienvenido");
  const [hoy, setHoy] = useState("");

  useEffect(() => {
    setSesion(leerSesion());
    const hora = new Date().getHours();
    setSaludo(hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches");
    setHoy(new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  }, []);

  const accesos = (sesion && ACCESOS_POR_ROL[sesion.rol]) || ACCESOS_GENERALES;

  return (
    <div className="grid gap-6 p-8 xl:grid-cols-[minmax(0,1fr)_18rem] bg-hospital-fondo min-h-screen">
      {/* ------------------------- Columna principal ------------------------- */}
      <div className="min-w-0">
        <header className="mb-8">
          <p className="min-h-5 text-sm text-slate-500 first-letter:uppercase">{hoy}</p>
          <h1 className="mt-1 text-4xl font-light text-slate-800">
            {saludo}{sesion ? `, ${sesion.nombre_completo}` : ""}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {sesion && (
              <span className="rounded-full bg-[#1E4E8C]/10 px-3 py-1 text-xs font-semibold text-[#1E4E8C]">
                {NOMBRE_ROL[sesion.rol] ?? sesion.rol}
              </span>
            )}
          </div>
        </header>

        {/* Tarjetas de Resumen Mejoradas con Iconos */}
        <section aria-label="Resumen" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {RESUMEN.map((r) => {
            const Icono = r.icono;
            return (
              <div key={r.etiqueta} className={`relative overflow-hidden rounded-xl border border-slate-200 border-t-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${r.acento}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{r.etiqueta}</p>
                    <p className="mt-2 text-4xl font-bold text-slate-800">{r.valor}</p>
                  </div>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${r.colorIcono}`}>
                    <Icono aria-hidden="true" className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">{r.detalle}</p>
              </div>
            );
          })}
        </section>

        {/* Alertas + actividad */}
        <div className="mb-8 grid grid-cols-1 gap-6 2xl:grid-cols-3">
          <section aria-labelledby="titulo-alertas" className="rounded-xl border border-slate-200 bg-white shadow-sm 2xl:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 id="titulo-alertas" className="text-lg font-semibold text-slate-800">Alertas por revisar</h2>
              <Link href="/auditoria" className={`text-sm font-medium text-[#1E4E8C] hover:underline ${FOCO}`}>Ver todas</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-3 font-medium">Expediente</th>
                    <th className="px-6 py-3 font-medium">Tipo</th>
                    <th className="px-6 py-3 font-medium">Severidad</th>
                    <th className="px-6 py-3 font-medium">Generada</th>
                  </tr>
                </thead>
                <tbody>
                  {ALERTAS.map((a) => (
                    <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">{a.expediente}</td>
                      <td className="px-6 py-3 text-slate-600">{a.tipo}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${ESTILO_SEVERIDAD[a.severidad]}`}>{a.severidad}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-500">{a.hace}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="titulo-actividad" className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 id="titulo-actividad" className="text-lg font-semibold text-slate-800">Actividad reciente</h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {ACTIVIDAD.map((x) => (
                <li key={x.id} className="px-6 py-3 hover:bg-slate-50 transition-colors">
                  <p className="text-sm text-slate-800">{x.texto}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{x.quien} · {x.hora}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Módulos */}
        <section aria-labelledby="titulo-modulos">
          <h2 id="titulo-modulos" className="mb-4 text-lg font-semibold text-slate-800">Módulos del sistema</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {MODULOS.map((m) => {
              const Icono = m.icono;
              return (
                <Link key={m.href} href={m.href} className={`flex items-start gap-4 rounded-xl border border-slate-200 border-t-4 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${m.borde} ${FOCO}`}>
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${m.chip}`}>
                    <Icono aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block text-lg font-semibold text-slate-800">{m.titulo}</span>
                    <span className="mt-1 block text-sm text-slate-500">{m.texto}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* ------------------------- Panel derecho ------------------------- */}
      <aside className="space-y-6">
        <section aria-labelledby="titulo-accesos" className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 id="titulo-accesos" className="text-base font-semibold text-slate-800">Accesos rápidos</h2>
          </div>
          <ul className="p-2">
            {accesos.map((a) => {
              const Icono = a.icono;
              return (
                <li key={a.etiqueta}>
                  <Link href={a.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 ${FOCO}`}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B7A86]/10 text-[#0B7A86]">
                      <Icono aria-hidden="true" className="h-4 w-4" />
                    </span>
                    {a.etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="titulo-ayuda" className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 id="titulo-ayuda" className="text-base font-semibold text-slate-800">Ayuda</h2>
          </div>
          <ul className="space-y-3 p-5 text-sm text-slate-600">
            <li className="flex items-center gap-3"><LifeBuoy className="h-4 w-4 text-slate-400" /> Soporte TI</li>
            <li className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-slate-400" /> Guía de uso</li>
          </ul>
          <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Acceso restringido. La actividad queda registrada.</p>
        </section>
      </aside>
    </div>
  );
}