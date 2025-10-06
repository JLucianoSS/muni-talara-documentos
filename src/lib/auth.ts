import { getCookie, setCookie, deleteCookie } from 'cookies-next';

export interface UserSession {
  id: number;
  username: string;
}

// Guardar sesión en cookies
export function setSession(user: UserSession) {
  setCookie('userSession', JSON.stringify(user), {
    maxAge: 30 * 24 * 60 * 60, // 30 días
    path: '/',
    httpOnly: false, // Para que sea accesible en el cliente (demo)
    secure: process.env.NODE_ENV === 'production', // Solo secure en producción
  });
}

// Obtener sesión de cookies
export function getSession(): UserSession | null {
  const session = getCookie('userSession');
  return session ? JSON.parse(session.toString()) : null;
}

// Limpiar sesión (logout)
export function clearSession() {
  deleteCookie('userSession');
}

// Verificar si hay un usuario logueado
export function isAuthenticated(): boolean {
  return !!getSession();
}