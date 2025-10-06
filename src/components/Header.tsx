'use client';

import { useRouter } from 'next/navigation';
import { clearSession } from '@/lib/auth';

export const Header = () => {
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <header className="bg-muni-white shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <img
          src="/logo-muni-talara.png"
          alt="Logo Municipalidad de Talara"
          className="h-10"
        />
        <h1 className="text-xl font-semibold text-gray-800">
          Sistema de Gestión Documental
        </h1>
      </div>
      <button
        onClick={handleLogout}
        className="bg-muni-blue text-muni-white cursor-pointer"
      >
        Cerrar Sesión
      </button>
    </header>
  );
}