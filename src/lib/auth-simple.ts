// Simple localStorage-based auth for demo mode
import { UsuariosDB } from './db';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  permisoSocios: boolean;
  permisoPlanes: boolean;
  permisoSuscripciones: boolean;
  permisoAsistencias: boolean;
  permisoReportes: boolean;
  permisoConfiguracion: boolean;
  permisoUsuarios: boolean;
  permisoTransacciones: boolean;
}

const SESSION_KEY = 'gym_session';

export function login(email: string, password: string): AuthUser | null {
  const user = UsuariosDB.findUnique({ email });
  if (!user) return null;
  if (user.password !== password) return null;

  const sessionUser: AuthUser = {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol,
    permisoSocios: user.permisoSocios,
    permisoPlanes: user.permisoPlanes,
    permisoSuscripciones: user.permisoSuscripciones,
    permisoAsistencias: user.permisoAsistencias,
    permisoReportes: user.permisoReportes,
    permisoConfiguracion: user.permisoConfiguracion,
    permisoUsuarios: user.permisoUsuarios,
    permisoTransacciones: user.permisoTransacciones,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  }

  return sessionUser;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
