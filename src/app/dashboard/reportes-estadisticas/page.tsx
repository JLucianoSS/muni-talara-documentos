import { getReportStats } from '@/actions/reportsActions';
import { ReportsDashboard } from '@/components/Reportes/ReportsDashboard';

export default async function ReportesEstadisticasPage() {
  const stats = await getReportStats();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reportes y Estadísticas</h2>
      <ReportsDashboard stats={stats} />
    </div>
  );
}
