import { getExpedientes, getAreas, getUsers } from '@/actions/expedientesActions';
import { ExpedientesTable } from '@/components/GestionExpedientes/ExpedientesTable';

export default async function GestionExpedientesPage() {
  const expedientes = await getExpedientes();
  const areas = await getAreas();
  const users = await getUsers();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Expedientes</h2>
      <ExpedientesTable expedientes={expedientes} areas={areas} users={users} />
    </div>
  );
}