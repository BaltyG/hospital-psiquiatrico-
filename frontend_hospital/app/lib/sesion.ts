export type Sesion = {
  id_profesional: number;
  username: string;
  nombre_completo: string;
  rol: string;
};

const CLAVE = "hospitalsys_sesion";

export function guardarSesion(sesion: Sesion) {
  sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
}

export function leerSesion(): Sesion | null {
  if (typeof window === "undefined") return null;
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as Sesion) : null;
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE);
}