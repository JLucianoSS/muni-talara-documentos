
import Link from 'next/link';
import { LayoutDashboard, FolderOpen, FileText, Search, Building2 } from 'lucide-react';
export const Sidebar = () => {

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
      </nav>
    </aside>
  );
}