
import Link from 'next/link';
export const Sidebar = () => {

  return (
    <aside className="w-64 bg-muni-white text-gray-800 h-screen p-4 shadow-lg sticky top-0">

      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="block px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/gestion-expedientes"
          className="block px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Expedientes
        </Link>
        <Link
          href="/dashboard/registro-documentos"
          className="block px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Documentos
        </Link>
        <Link
          href="/dashboard/busqueda-avanzada"
          className="block px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Búsqueda
        </Link>
        {/* <Link
          href="/dashboard/reportes-estadisticas"
          className="block px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Reportes
        </Link> */}
        <Link
          href="/dashboard/areas"
          className="block px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          Áreas
        </Link>
      </nav>
    </aside>
  );
}