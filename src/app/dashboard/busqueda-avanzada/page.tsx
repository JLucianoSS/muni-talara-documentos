import { getSearchFilters } from '@/actions/searchActions';
import { AdvancedSearch } from '@/components/Busqueda/AdvancedSearch';

export default async function BusquedaAvanzadaPage() {
  const filters = await getSearchFilters();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Búsqueda Avanzada</h2>
      <AdvancedSearch initialFilters={filters} />
    </div>
  );
}
