import { getAreas } from '@/actions/expedientesActions';
import { AreasTable } from '@/components/Areas/AreasTable';

export default async function AreasPage() {
  const areas = await getAreas();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Áreas</h2>
      <AreasTable areas={areas} />
    </div>
  );
}


