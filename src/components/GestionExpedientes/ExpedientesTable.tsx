'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { ExpedienteForm, type ExpedienteFormData } from './ExpedienteForm';
import {
  fetchExpedientesClient,
  createExpedienteClient,
  updateExpedienteClient,
  deleteExpedienteClient,
  fetchExpedientesWithDocumentsClient,
} from '@/lib/clientApi';
import { Edit, Trash2, Eye } from 'lucide-react';
import ExpedienteDocumentsModal from '../ExpedienteDocumentsModal';
import { getExpedienteStateInfo } from '@/lib/expedienteUtils';

type Expediente = {
  id: number;
  number: string;
  state: 'en_tramite' | 'cerrado' | 'pendiente';
  createdAt: Date;
  updatedAt: Date;
  responsibleUsername: string | null;
  areaName: string | null;
  hasDocuments?: boolean;
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
  const [viewDocuments, setViewDocuments] = useState<{ expedienteId: number; expedienteNumber: string } | null>(null);

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
      const data = await fetchExpedientesWithDocumentsClient();
      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setExpedientes(sortedData);
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
    } catch (error: unknown) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Error al eliminar expediente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#0093DF] hover:bg-[#007AC0] text-[#FFFFFF] rounded-md cursor-pointer"
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
              areaId: areas.find((a) => a.name === editExpediente.areaName)?.id ?? 0,
            }}
            onSubmit={handleUpdate}
            areas={areas}
            users={users}
            onClose={() => setEditExpediente(null)}
          />
        )}
      </Modal>
      <div className='overflow-x-auto rounded-md'>
        <table className="w-full border-collapse bg-[#FFFFFF] shadow-md rounded-lg">
          <thead>
            <tr className="bg-blue-100 text-gray-800">
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
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  <div className="p-6 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0093DF] mx-auto mb-2"></div>
                    Cargando expedientes...
                  </div>
                </td>
              </tr>
            ) : filteredExpedientes.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">No hay expedientes.</td>
              </tr>
            ) : (
              filteredExpedientes.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <div>{exp.number}</div>
                      {exp.hasDocuments && (
                        <div className="text-xs text-green-600 mt-1">
                          📄 Tiene documentos
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getExpedienteStateInfo(exp.state).color}`}>
                      <span className={`w-2 h-2 rounded-full ${getExpedienteStateInfo(exp.state).dotColor}`}></span>
                      {getExpedienteStateInfo(exp.state).label}
                    </span>
                  </td>
                  <td className="p-3">{exp.responsibleUsername}</td>
                  <td className="p-3">{exp.areaName}</td>
                  <td className="p-3">
                    <div>
                      {new Date(exp.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(exp.createdAt).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      {new Date(exp.updatedAt).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(exp.updatedAt).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewDocuments({ expedienteId: exp.id, expedienteNumber: exp.number })}
                        className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer transition-colors"
                        title="Ver Documentos"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setEditExpediente(exp)}
                        className="px-2 py-1 bg-[#0093DF] text-[#FFFFFF] rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                        title="Editar Expediente"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        disabled={exp.hasDocuments}
                        className={`px-2 py-1 text-[#FFFFFF] rounded-md transition-colors ${
                          exp.hasDocuments 
                            ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                            : 'bg-red-500 hover:bg-red-600 cursor-pointer'
                        }`}
                        title={exp.hasDocuments ? "No se puede eliminar: tiene documentos asignados" : "Eliminar Expediente"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <ExpedienteDocumentsModal
        isOpen={!!viewDocuments}
        onClose={() => setViewDocuments(null)}
        expedienteId={viewDocuments?.expedienteId || 0}
        expedienteNumber={viewDocuments?.expedienteNumber || ''}
      />
    </div>
  );
};