import { getExpedientes, getAreas, getUsers } from '@/actions/expedientesActions';
import { ExpedientesTableWithPagination } from '@/components/GestionExpedientes/ExpedientesTableWithPagination';

export default async function GestionExpedientesPage() {
  const expedientesData = await getExpedientes(1, 10);
  const areas = await getAreas();
  const users = await getUsers();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Expedientes</h2>
      <ExpedientesTableWithPagination 
        expedientes={expedientesData.data} 
        areas={areas} 
        users={users} 
      />
    </div>
  );
}