import { getDocuments } from '@/actions/documentsActions';
import { getExpedientes } from '@/actions/expedientesActions';
import { DocumentsTableWithPagination } from '@/components/Documentos/DocumentsTableWithPagination';

export default async function RegistroDocumentosPage() {
  const [documentsData, expedientesData] = await Promise.all([
    getDocuments(1, 10),
    getExpedientes(1, 1000), // Obtener todos los expedientes para el formulario
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Registro de Documentos</h2>
      <DocumentsTableWithPagination
        documents={documentsData.data}
        expedientes={expedientesData.data}
      />
    </div>
  );
}


