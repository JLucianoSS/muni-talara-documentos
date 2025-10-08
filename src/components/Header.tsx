'use client';

import { useRouter } from 'next/navigation';
import { clearSession } from '@/lib/auth';
import { LogOut } from 'lucide-react';

export const Header = () => {
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  return (
    <header className="bg-muni-white shadow-xs p-4 flex items-center justify-between">
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
        className="flex items-center gap-2 px-4 py-2 bg-muni-blue text-muni-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
      >
        <LogOut size={18} />
        Cerrar Sesión
      </button>
    </header>
  );
}