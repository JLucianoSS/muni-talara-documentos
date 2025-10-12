
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LayoutDashboard, FolderOpen, FileText, Search, Building2, Trash2 } from 'lucide-react';
import { fetchDeletedDocumentsClient } from '@/lib/clientApi';

export const Sidebar = () => {
  const [deletedCount, setDeletedCount] = useState<number>(0);

  const loadDeletedCount = async () => {
    try {
      const data = await fetchDeletedDocumentsClient(1, 1);
      const total = data?.pagination?.total ?? 0;
      setDeletedCount(total);
    } catch (error) {
      console.error('Error cargando contador de papelera:', error);
    }
  };

  useEffect(() => {
    loadDeletedCount();

    const handler = () => {
      loadDeletedCount();
    };

    window.addEventListener('trash-changed', handler);

    // fallback polling cada 30s por si algo falla
    const interval = setInterval(loadDeletedCount, 30000);

    return () => {
      window.removeEventListener('trash-changed', handler);
      clearInterval(interval);
    };
  }, []);

  return (
    <aside className="w-64 bg-muni-white text-gray-800 h-screen p-4 shadow-md sticky top-0">

      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link
          href="/dashboard/gestion-expedientes"
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <FolderOpen size={20} />
          Expedientes
        </Link>
        <Link
          href="/dashboard/registro-documentos"
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <FileText size={20} />
          Documentos
        </Link>
        
        <Link
          href="/dashboard/busqueda-avanzada"
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Search size={20} />
          Búsqueda
        </Link>
        {/* <Link
          href="/dashboard/reportes-estadisticas"
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <BarChart3 size={20} />
          Reportes
        </Link> */}
        <Link
          href="/dashboard/areas"
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Building2 size={20} />
          Áreas
        </Link>
        <Link
          href="/dashboard/papelera"
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Trash2 size={20} />
          <span>Papelera</span>
          {deletedCount > 0 && (
            <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
              {deletedCount}
            </span>
          )}
        </Link>
      </nav>
    </aside>
  );
}