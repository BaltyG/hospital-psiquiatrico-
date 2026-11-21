import { leerSesion } from "../lib/sesion";

export const API_URL = "http://localhost:8000";

export function headersAdmin(): Record<string, string> {
  const sesion = leerSesion();
  if (!sesion) return {};
  return { "X-Profesional-Id": String(sesion.id_profesional) };
}