'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { fetchDocumentsByExpedienteClient } from '@/lib/clientApi';
import { FileText, Calendar, User, Building2, ExternalLink } from 'lucide-react';

type Document = {
  id: number;
  expedienteId: number;
  name: string;
  date: string;
  filePath: string;
  responsibleUsername: string;
  areaName: string;
  expedienteNumber: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  expedienteId: number;
  expedienteNumber: string;
};

export const ExpedienteDocumentsModal = ({ isOpen, onClose, expedienteId, expedienteNumber }: Props) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && expedienteId) {
      fetchDocuments();
    }
  }, [isOpen, expedienteId]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDocumentsByExpedienteClient(expedienteId);
      setDocuments(data);
    } catch (err) {
      setError('Error al cargar los documentos');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Documentos del Expediente ${expedienteNumber}`} size="lg">
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0093DF]"></div>
            <span className="ml-3 text-gray-600">Cargando documentos...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={fetchDocuments}
              className="mt-2 px-4 py-2 bg-[#0093DF] text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay documentos en este expediente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={20} className="text-[#0093DF]" />
                      <h3 className="font-medium text-gray-900">{doc.name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{new Date(doc.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span>{doc.responsibleUsername}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        <span>{doc.areaName}</span>
                      </div>
                    </div>
                  </div>
                  
                  {doc.filePath && (
                    <a
                      href={doc.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-[#0093DF] text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <ExternalLink size={16} />
                      Ver
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExpedienteDocumentsModal;
