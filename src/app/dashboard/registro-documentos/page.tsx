import { getDocuments } from '@/actions/documentsActions';
import { getExpedientes } from '@/actions/expedientesActions';
import { DocumentsTable } from '@/components/Documentos/DocumentsTable';

export default async function RegistroDocumentosPage() {
  const [documents, expedientes] = await Promise.all([
    getDocuments(),
    getExpedientes(),
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Registro de Documentos</h2>
      <DocumentsTable
        documents={documents}
        expedientes={expedientes}
      />
    </div>
  );
}


