import { getDeletedDocuments } from '@/actions/documentsActions';
import { TrashDocumentsTable } from '@/components/Papelera/TrashDocumentsTable';

export default async function PapeleraPage() {
  const deletedDocumentsData = await getDeletedDocuments(1, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Papelera de Documentos</h1>
          <p className="text-gray-600 mt-1">
            Documentos eliminados temporalmente. Puedes restaurarlos o eliminarlos permanentemente.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {deletedDocumentsData.pagination.total} documento{deletedDocumentsData.pagination.total !== 1 ? 's' : ''} en la papelera
        </div>
      </div>

      <TrashDocumentsTable documents={deletedDocumentsData.data} pagination={deletedDocumentsData.pagination} />
    </div>
  );
}
