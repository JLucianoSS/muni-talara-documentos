'use client';

import { useEffect, useMemo, useState } from 'react';
import { createAreaClient, fetchAreasClient, deleteAreaClient, fetchAreasWithExpedientesClient } from '@/lib/clientApi';
import { Trash2 } from 'lucide-react';

type Area = { id: number; name: string; hasExpedientes?: boolean };

type AreasTableProps = {
  areas: Area[];
};

export const AreasTable = ({ areas: initialAreas }: AreasTableProps) => {
  const [areas, setAreas] = useState<Area[]>(initialAreas);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState('');

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await fetchAreasWithExpedientesClient();
      const sortedData = [...data].sort((a, b) => b.id - a.id);
      setAreas(sortedData);
    } catch {
      setMessage('Error cargando áreas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canCreate = useMemo(() => name.trim().length > 2, [name]);

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    try {
      await createAreaClient(name.trim());
      setName('');
      setMessage('Área creada');
      await refetch();
    } catch {
      setMessage('No se pudo crear el área');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta área? Esta acción no se puede deshacer.')) return;
    setLoading(true);
    try {
      await deleteAreaClient(id);
      setMessage('Área eliminada');
      await refetch();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar el área');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Nueva área</label>
          <input
            className="w-full border border-gray-400 rounded-md px-3 py-2"
            placeholder="Ej. Secretaría"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={!canCreate || loading}
          className="px-4 py-2 rounded-md bg-[#0093DF] text-white disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Guardando...' : 'Agregar'}
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-400 rounded-md">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-gray-600">ID</th>
              <th className="text-left p-3 text-gray-600">Nombre</th>
              <th className="text-left p-3 text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  <div className="p-6 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0093DF] mx-auto mb-2"></div>
                    Cargando áreas...
                  </div>
                </td>
              </tr>
            ) : areas.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">No hay áreas registradas.</td>
              </tr>
            ) : (
              areas.map((a) => (
                <tr key={a.id} className="border-t border-gray-400 hover:bg-gray-50">
                  <td className="p-3">{a.id}</td>
                  <td className="p-3 font-medium">
                    <div>
                      <div>{a.name}</div>
                      {a.hasExpedientes && (
                        <div className="text-xs text-blue-600 mt-1">
                          📁 Tiene expedientes asignados
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={a.hasExpedientes}
                      className={`px-3 py-1 text-white rounded-md text-sm flex items-center gap-2 transition-colors ${
                        a.hasExpedientes 
                          ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                          : 'bg-red-500 hover:bg-red-600 cursor-pointer'
                      }`}
                      title={a.hasExpedientes ? "No se puede eliminar: tiene expedientes asignados" : "Eliminar Área"}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default AreasTable;


