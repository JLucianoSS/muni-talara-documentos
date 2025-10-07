'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { ExpedienteForm, type ExpedienteFormData } from './ExpedienteForm';
import {
  fetchExpedientesClient,
  createExpedienteClient,
  updateExpedienteClient,
  deleteExpedienteClient,
} from '@/lib/clientApi';

type Expediente = {
  id: number;
  number: string;
  state: 'en_tramite' | 'cerrado' | 'pendiente';
  createdAt: Date;
  updatedAt: Date;
  responsibleUsername: string | null;
  areaName: string | null;
};



type ExpedientesTableProps = {
  expedientes: Expediente[];
  areas: Array<{ id: number; name: string }>;
  users: Array<{ id: number; username: string }>;
};

export const ExpedientesTable = ({ expedientes: initialExpedientes, areas, users }: ExpedientesTableProps) => {
  const [expedientes, setExpedientes] = useState(initialExpedientes);
  const [filterState, setFilterState] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editExpediente, setEditExpediente] = useState<Expediente | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filteredExpedientes = expedientes.filter((exp) => {
    return (
      (filterState ? exp.state === filterState : true) &&
      (filterArea ? exp.areaName === filterArea : true)
    );
  });

  // refetch list from API
  const refetch = async () => {
    setLoading(true);
    try {
      const data = await fetchExpedientesClient();
      setExpedientes(data);
    } catch (e) {
      console.error(e);
      setMessage('Error cargando expedientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ensure latest data on client mount
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (data: ExpedienteFormData) => {
    setLoading(true);
    try {
      await createExpedienteClient(data);
      setIsCreateModalOpen(false);
      setMessage('Expediente creado');
      await refetch();
    } catch (e) {
      console.error(e);
      setMessage('Error al crear expediente');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: ExpedienteFormData) => {
    if (!editExpediente) return;
    setLoading(true);
    try {
      await updateExpedienteClient(editExpediente.id, data);
      setEditExpediente(null);
      setMessage('Expediente actualizado');
      await refetch();
    } catch (e) {
      console.error(e);
      setMessage('Error al actualizar expediente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este expediente?')) return;
    setLoading(true);
    try {
      await deleteExpedienteClient(id);
      setMessage('Expediente eliminado');
      await refetch();
    } catch (e) {
      console.error(e);
      setMessage('Error al eliminar expediente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#0093DF] text-[#FFFFFF] rounded-md hover:bg-blue-700"
        >
          Crear Expediente
        </button>
        <div className="flex space-x-2">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Filtrar por estado</option>
            <option value="en_tramite">En Trámite</option>
            <option value="cerrado">Cerrado</option>
            <option value="pendiente">Pendiente</option>
          </select>
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Filtrar por área</option>
            {areas.map((area) => (
              <option key={area.id} value={area.name}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Expediente"
      >
        <ExpedienteForm
          onSubmit={handleCreate}
          areas={areas}
          users={users}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={!!editExpediente}
        onClose={() => setEditExpediente(null)}
        title="Editar Expediente"
      >
        {editExpediente && (
          <ExpedienteForm
            defaultValues={{
              number: editExpediente.number,
              state: editExpediente.state,
              responsibleUserId: users.find((u) => u.username === editExpediente.responsibleUsername)?.id,
              areaName: editExpediente.areaName ?? '',
            }}
            onSubmit={handleUpdate}
            areas={areas}
            users={users}
            onClose={() => setEditExpediente(null)}
          />
        )}
      </Modal>
      <table className="w-full border-collapse bg-[#FFFFFF] shadow-md rounded-lg">
        <thead>
          <tr className="bg-[#0093DF] text-[#FFFFFF]">
            <th className="p-3 text-left">Número</th>
            <th className="p-3 text-left">Estado</th>
            <th className="p-3 text-left">Responsable</th>
            <th className="p-3 text-left">Área</th>
            <th className="p-3 text-left">Creado</th>
            <th className="p-3 text-left">Actualizado</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="p-6 text-center text-gray-500">Cargando expedientes...</td>
            </tr>
          ) : filteredExpedientes.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-6 text-center text-gray-500">No hay expedientes.</td>
            </tr>
          ) : (
            filteredExpedientes.map((exp) => (
              <tr key={exp.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{exp.number}</td>
                <td className="p-3">{exp.state}</td>
                <td className="p-3">{exp.responsibleUsername}</td>
                <td className="p-3">{exp.areaName}</td>
                <td className="p-3">{new Date(exp.createdAt).toLocaleDateString()}</td>
                <td className="p-3">{new Date(exp.updatedAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditExpediente(exp)}
                      className="px-2 py-1 bg-[#0093DF] text-[#FFFFFF] rounded-md hover:bg-blue-700"
                    >
                      📝
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="px-2 py-1 bg-red-500 text-[#FFFFFF] rounded-md hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};