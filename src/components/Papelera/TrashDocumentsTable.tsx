'use client';

import { useState } from 'react';
import { Trash2, RotateCcw, Eye, Download } from 'lucide-react';
import { restoreDocument, permanentlyDeleteDocument } from '@/actions/documentsActions';
import { Pagination } from '../Pagination';
import { fetchDeletedDocumentsClient } from '@/lib/clientApi';

type DeletedDocument = {
  id: number;
  expedienteId: number;
  name: string;
  date: Date;
  filePath: string;
  deletedAt: Date;
  responsibleUsername: string | null;
  areaName: string | null;
  expedienteNumber: string | null;
};

type Props = {
  documents: DeletedDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const TrashDocumentsTable = ({ documents: initialDocuments, pagination: initialPagination }: Props) => {
  const [loading, setLoading] = useState<number | null>(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [pagination, setPagination] = useState(initialPagination);

  const refetch = async (page: number = pagination.page) => {
    try {
      const data = await fetchDeletedDocumentsClient(page, 10);
      setDocuments(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    }
  };

  const handlePageChange = (page: number) => {
    refetch(page);
  };

  const handleRestore = async (id: number) => {
    setLoading(id);
    try {
      await restoreDocument(id);
      await refetch();
    } catch (error) {
      console.error('Error al restaurar documento:', error);
    } finally {
      setLoading(null);
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar permanentemente este documento? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setLoading(id);
    try {
      await permanentlyDeleteDocument(id);
      await refetch();
    } catch (error) {
      console.error('Error al eliminar permanentemente:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = (filePath: string) => {
    window.open(filePath, '_blank');
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 text-lg">
          <Trash2 size={48} className="mx-auto mb-4 text-gray-300" />
          <p>La papelera está vacía</p>
          <p className="text-sm mt-2">Los documentos eliminados aparecerán aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-gray-600 font-medium">Documento</th>
              <th className="p-4 text-left text-gray-600 font-medium">Expediente</th>
              <th className="p-4 text-left text-gray-600 font-medium">Área</th>
              <th className="p-4 text-left text-gray-600 font-medium">Responsable</th>
              <th className="p-4 text-left text-gray-600 font-medium">Fecha Original</th>
              <th className="p-4 text-left text-gray-600 font-medium">Eliminado</th>
              <th className="p-4 text-left text-gray-600 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{doc.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(doc.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {doc.expedienteNumber || 'N/A'}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {doc.areaName || 'N/A'}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {doc.responsibleUsername || 'N/A'}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(doc.date).toLocaleDateString('es-ES')}
                </td>
                <td className="p-4 text-sm text-red-600">
                  {new Date(doc.deletedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(doc.filePath)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Ver/Descargar"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleRestore(doc.id)}
                      disabled={loading === doc.id}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
                      title="Restaurar"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(doc.id)}
                      disabled={loading === doc.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      title="Eliminar permanentemente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
      />
    </div>
  );
};

export default TrashDocumentsTable;
