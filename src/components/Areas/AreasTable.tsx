'use client';

import { useEffect, useMemo, useState } from 'react';
import { createAreaClient, fetchAreasClient, deleteAreaClient } from '@/lib/clientApi';

type Area = { id: number; name: string };

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
      const data = await fetchAreasClient();
      setAreas(data);
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
    } catch {
      setMessage('No se pudo eliminar el área');
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
            className="w-full border rounded-md px-3 py-2"
            placeholder="Ej. Secretaría"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={!canCreate || loading}
          className="px-4 py-2 rounded-md bg-[#0093DF] text-white disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Agregar'}
        </button>
      </div>

      <div className="overflow-x-auto border rounded-md">
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
                <td colSpan={3} className="p-6 text-center text-gray-500">Cargando áreas...</td>
              </tr>
            ) : areas.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">No hay áreas registradas.</td>
              </tr>
            ) : (
              areas.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{a.id}</td>
                  <td className="p-3 font-medium">{a.name}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    >
                      🗑️ Eliminar
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


