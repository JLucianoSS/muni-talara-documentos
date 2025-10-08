'use client';

import { useEffect, useState } from 'react';
import { getReportsClient } from '@/lib/clientApi';
import { StatsCard } from './StatsCard';
import { ChartCard } from './ChartCard';

type ReportStats = {
  totalDocuments: number;
  totalExpedientes: number;
  documentsByType: Array<{ type: string; count: number }>;
  expedientesByState: Array<{ state: string; count: number }>;
  documentsByArea: Array<{ areaName: string; count: number }>;
  expedientesByArea: Array<{ areaName: string; count: number }>;
  recentDocuments: Array<{
    id: number;
    name: string;
    type: string;
    date: Date;
    expedienteNumber: string;
    areaName: string;
  }>;
  recentExpedientes: Array<{
    id: number;
    number: string;
    state: string;
    createdAt: Date;
    areaName: string;
  }>;
  monthlyStats: Array<{
    month: string;
    documents: number;
    expedientes: number;
  }>;
};

type Props = {
  stats: ReportStats;
};

export const ReportsDashboard = ({ stats: initialStats }: Props) => {
  const [stats, setStats] = useState<ReportStats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshStats = async () => {
    setLoading(true);
    try {
      const newStats = await getReportsClient();
      setStats(newStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'en_tramite': return 'blue';
      case 'cerrado': return 'green';
      case 'pendiente': return 'orange';
      default: return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'red';
      case 'Word': return 'blue';
      case 'Excel': return 'green';
      case 'Otro': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de actualizar */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            Última actualización: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <button
          onClick={refreshStats}
          disabled={loading}
          className="px-4 py-2 bg-[#0093DF] text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Actualizando...
            </>
          ) : (
            <>
              🔄 Actualizar
            </>
          )}
        </button>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Documentos"
          value={stats.totalDocuments}
          icon="📄"
          color="blue"
          subtitle="Documentos digitalizados"
        />
        <StatsCard
          title="Total de Expedientes"
          value={stats.totalExpedientes}
          icon="📁"
          color="green"
          subtitle="Expedientes registrados"
        />
        <StatsCard
          title="Documentos este mes"
          value={stats.monthlyStats[stats.monthlyStats.length - 1]?.documents || 0}
          icon="📈"
          color="purple"
          subtitle="Último mes registrado"
        />
        <StatsCard
          title="Expedientes activos"
          value={stats.expedientesByState.find(s => s.state === 'en_tramite')?.count || 0}
          icon="⚡"
          color="orange"
          subtitle="En proceso"
        />
      </div>

      {/* Gráficos y estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documentos por tipo */}
        <ChartCard title="Documentos por Tipo">
          <div className="space-y-3">
            {stats.documentsByType.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${getTypeColor(item.type)}-500`}></div>
                  <span className="font-medium">{item.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{item.count}</span>
                  <span className="text-sm text-gray-500">
                    ({Math.round((item.count / stats.totalDocuments) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Expedientes por estado */}
        <ChartCard title="Expedientes por Estado">
          <div className="space-y-3">
            {stats.expedientesByState.map((item) => (
              <div key={item.state} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${getStateColor(item.state)}-500`}></div>
                  <span className="font-medium capitalize">
                    {item.state.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{item.count}</span>
                  <span className="text-sm text-gray-500">
                    ({Math.round((item.count / stats.totalExpedientes) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Documentos por área */}
        <ChartCard title="Documentos por Área">
          <div className="space-y-3">
            {stats.documentsByArea.map((item) => (
              <div key={item.areaName} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="font-medium">{item.areaName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{item.count}</span>
                  <span className="text-sm text-gray-500">
                    ({Math.round((item.count / stats.totalDocuments) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Expedientes por área */}
        <ChartCard title="Expedientes por Área">
          <div className="space-y-3">
            {stats.expedientesByArea.map((item) => (
              <div key={item.areaName} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">{item.areaName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{item.count}</span>
                  <span className="text-sm text-gray-500">
                    ({Math.round((item.count / stats.totalExpedientes) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documentos recientes */}
        <ChartCard title="Documentos Recientes">
          <div className="space-y-4">
            {stats.recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{doc.name}</p>
                  <p className="text-sm text-gray-600">
                    {doc.type} • {doc.expedienteNumber} • {doc.areaName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(doc.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-2xl">
                  {doc.type === 'PDF' ? '📄' : doc.type === 'Word' ? '📝' : doc.type === 'Excel' ? '📊' : '📎'}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Expedientes recientes */}
        <ChartCard title="Expedientes Recientes">
          <div className="space-y-4">
            {stats.recentExpedientes.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{exp.number}</p>
                  <p className="text-sm text-gray-600">
                    {exp.state.replace('_', ' ')} • {exp.areaName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(exp.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  exp.state === 'en_tramite' ? 'bg-blue-100 text-blue-800' :
                  exp.state === 'cerrado' ? 'bg-green-100 text-green-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {exp.state.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Estadísticas mensuales */}
      <ChartCard title="Actividad Mensual" className="col-span-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.monthlyStats.map((month) => (
            <div key={month.month} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">
                {new Date(month.month + '-01').toLocaleDateString('es', { month: 'short', year: 'numeric' })}
              </p>
              <p className="text-2xl font-bold text-[#0093DF] mt-2">{month.documents}</p>
              <p className="text-xs text-gray-500">documentos</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
};

export default ReportsDashboard;
