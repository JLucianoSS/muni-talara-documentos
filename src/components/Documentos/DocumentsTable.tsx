'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { DocumentForm, type DocumentFormData } from './DocumentForm';
import { 
  fetchDocumentsClient,
  createDocumentClient,
  updateDocumentClient,
  deleteDocumentClient,
} from '@/lib/clientApi';

type DocumentRow = {
  id: number;
  expedienteId: number;
  name: string;
  expedienteNumber: string;
  type: 'PDF' | 'Word' | 'Excel' | 'Otro';
  date: string;
  filePath: string;
  responsibleUsername: string | null;
  areaName: string | null;
};

type Option = { id: number; name?: string; username?: string; number?: string };

type Props = {
  documents: DocumentRow[];
  expedientes: Option[];
};

export const DocumentsTable = ({ documents: initialDocs, expedientes }: Props) => {
  const [documents, setDocuments] = useState<DocumentRow[]>(initialDocs);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<DocumentRow | null>(null);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await fetchDocumentsClient();
      setDocuments(data);
    } catch {
      setMessage('Error cargando documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (data: DocumentFormData) => {
    setLoading(true);
    try {
      await createDocumentClient(data);
      setIsCreateOpen(false);
      setMessage('Documento creado');
      await refetch();
    } catch {
      setMessage('No se pudo crear el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: DocumentFormData) => {
    if (!editDoc) return;
    setLoading(true);
    try {
      await updateDocumentClient(editDoc.id, data);
      setEditDoc(null);
      setMessage('Documento actualizado');
      await refetch();
    } catch {
      setMessage('No se pudo actualizar el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este documento?')) return;
    setLoading(true);
    try {
      await deleteDocumentClient(id);
      setMessage('Documento eliminado');
      await refetch();
    } catch {
      setMessage('No se pudo eliminar el documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-[#0093DF] text-white rounded-md hover:bg-blue-700"
        >
          Registrar Documento
        </button>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Registrar Documento">
        <DocumentForm onSubmit={handleCreate} expedientes={expedientes} onClose={() => setIsCreateOpen(false)} />
      </Modal>
      <Modal isOpen={!!editDoc} onClose={() => setEditDoc(null)} title="Editar Documento">
        {editDoc && (
          <DocumentForm
            onSubmit={handleUpdate}
            expedientes={expedientes}
            defaultValues={{
              expedienteId: editDoc.expedienteId,
              name: editDoc.name,
              type: editDoc.type,
              date: editDoc.date.slice(0, 10),
              filePath: editDoc.filePath,
            }}
            onClose={() => setEditDoc(null)}
          />
        )}
      </Modal>

      <table className="w-full border-collapse bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-[#0093DF] text-white">
            <th className="p-3 text-left">Expediente</th>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Tipo</th>
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Área</th>
            <th className="p-3 text-left">Responsable</th>
            <th className="p-3 text-left">Archivo</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="p-6 text-center text-gray-500">Cargando documentos...</td>
            </tr>
          ) : documents.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-6 text-center text-gray-500">No hay documentos.</td>
            </tr>
          ) : (
            documents.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{d.expedienteNumber}</td>
                <td className="p-3">{d.name}</td>
                <td className="p-3">{d.type}</td>
                <td className="p-3">{new Date(d.date).toLocaleDateString()}</td>
                <td className="p-3">{d.areaName}</td>
                <td className="p-3">{d.responsibleUsername}</td>
                <td className="p-3">
                  {d.filePath ? (
                    <a href={d.filePath} target="_blank" rel="noreferrer" className="text-[#0093DF] underline">
                      Ver/Descargar
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => setEditDoc(d)} className="px-2 py-1 bg-[#0093DF] text-white rounded-md">📝</button>
                  <button onClick={() => handleDelete(d.id)} className="px-2 py-1 bg-red-500 text-white rounded-md">🗑️</button>
                </td>
              </tr>)
            )
          )}
        </tbody>
      </table>
      {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
    </div>
  );
};

export default DocumentsTable;


