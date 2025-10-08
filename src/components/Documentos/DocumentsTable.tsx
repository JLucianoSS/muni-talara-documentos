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
import { Edit, Trash2 } from 'lucide-react';

type DocumentRow = {
  id: number;
  expedienteId: number;
  name: string;
  expedienteNumber: string | null;
  date: Date;
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
      const sortedData = [...data].sort((a, b) => b.id - a.id);
      setDocuments(sortedData);
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
          className="px-4 py-2 bg-[#0093DF] hover:bg-[#007AC0] text-white rounded-md cursor-pointer"
        >
          Registrar Documento
        </button>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Registrar Documento" size="lg">
        <DocumentForm onSubmit={handleCreate} expedientes={expedientes} onClose={() => setIsCreateOpen(false)} />
      </Modal>
      <Modal isOpen={!!editDoc} onClose={() => setEditDoc(null)} title="Editar Documento" size="lg">
        {editDoc && (
          <DocumentForm
            onSubmit={handleUpdate}
            expedientes={expedientes}
            defaultValues={{
              expedienteId: editDoc.expedienteId,
              name: editDoc.name,
              date: new Date(editDoc.date).toISOString().slice(0, 16),
              filePath: editDoc.filePath,
            }}
            onClose={() => setEditDoc(null)}
            isEditing={true}
          />
        )}
      </Modal>

      <div className='overflow-x-auto rounded-md'>
        <table className="w-full border-collapse bg-white shadow-md ">
          <thead>
            <tr className="bg-blue-100 text-gray-800 ">
              <th className="p-3 text-left">Expediente</th>
              <th className="p-3 text-left">Nombre</th>
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
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  <div className="p-6 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0093DF] mx-auto mb-2"></div>
                    Cargando documentos...
                  </div>
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">No hay documentos.</td>
              </tr>
            ) : (
              documents.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="p-3">{d.expedienteNumber || 'N/A'}</td>
                  <td className="p-3">{d.name}</td>
                  <td className="p-3">
                    <div>
                      {new Date(d.date).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(d.date).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </td>
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
                    <button
                      onClick={() => setEditDoc(d)}
                      className="px-2 py-1 bg-[#0093DF] text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
                      title="Editar Documento"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md cursor-pointer hover:bg-red-600 transition-colors"
                      title="Eliminar Documento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>)
              )
            )}
          </tbody>
        </table>
      </div>
      {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
    </div>
  );
};

export default DocumentsTable;


