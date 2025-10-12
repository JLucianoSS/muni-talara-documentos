'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchClient, getSearchFiltersClient } from '@/lib/clientApi';
import { Eye, X } from 'lucide-react';
import ExpedienteDocumentsModal from '../ExpedienteDocumentsModal';
import { getExpedienteStateInfo } from '@/lib/expedienteUtils';

type SearchResult = {
  id: string;
  type: 'expediente' | 'documento';
  title: string;
  description: string;
  date: string;
  area: string;
  responsible: string;
  expedienteNumber?: string;
  documentName?: string;
  filePath?: string;
  state?: string;
};

type SearchFilters = {
  areas: Array<{ id: number; name: string }>;
  years: number[];
};

type Props = {
  initialFilters: SearchFilters;
};

// Función para formatear la descripción del expediente con el estado en negrita
const formatExpedienteDescription = (description: string, state?: string) => {
  if (!state || !description.includes('Expediente')) {
    return description;
  }
  
  const stateInfo = getExpedienteStateInfo(state as 'en_tramite' | 'cerrado' | 'pendiente');
  const parts = description.split(' - ');
  if (parts.length >= 2) {
    const expedientePart = parts[0]; // "Expediente En trámite"
    const areaPart = parts.slice(1).join(' - '); // "Secretaria"
    
    // Extraer el estado de la parte del expediente
    const expedienteText = expedientePart.replace(stateInfo.label, '');
    return `${expedienteText}<strong>${stateInfo.label}</strong>
    `;
  }
  
  return description;
};

export const AdvancedSearch = ({ initialFilters }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    areaId: '',
    expedienteState: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortOrder: 'desc',
    searchType: 'all'
  });
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [viewDocuments, setViewDocuments] = useState<{ expedienteId: number; expedienteNumber: string } | null>(null);

  const search = useCallback(async (page = 1) => {
    if (!searchTerm.trim() && !Object.values(filters).some(v => v)) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchFilters = {
        term: searchTerm,
        year: filters.year ? Number(filters.year) : undefined,
        areaId: filters.areaId ? Number(filters.areaId) : undefined,
        expedienteState: filters.expedienteState || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        searchType: filters.searchType,
        page,
        limit: 10
      };

      const data = await searchClient(searchFilters);
      setResults(data.results);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total
      });
      setMessage(null);
    } catch (error) {
      console.error('Search error:', error);
      setMessage('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  // Búsqueda reactiva con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters, search]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      year: '',
      areaId: '',
      expedienteState: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date',
      sortOrder: 'desc',
      searchType: 'all'
    });
  };

  const clearSearchTerm = () => {
    setSearchTerm('');
  };

  const handlePageChange = (newPage: number) => {
    search(newPage);
  };

  const handleDownload = (result: SearchResult) => {
    if (result.filePath) {
      window.open(result.filePath, '_blank');
    }
  };

  const handleShare = (result: SearchResult) => {
    const shareText = `${result.title} - ${result.description}`;
    if (navigator.share) {
      navigator.share({
        title: result.title,
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      setMessage('Enlace copiado al portapapeles');
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda principal */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar códigos, nombres, expedientes... (ej: O.C, 00491, Titulo...)"
              className="w-full px-4 py-2 pr-10 border border-gray-400 rounded-md focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0093DF]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={clearSearchTerm}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpiar búsqueda"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 cursor-pointer"
          >
            Limpiar Todo
          </button>
        </div>

        {/* Información sobre búsqueda flexible */}
        {/* <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>💡 Búsqueda flexible:</strong> Ignora mayúsculas, tildes y caracteres especiales. 
            <br />
            <strong>Ejemplos:</strong>
            <br />
            • "maria" → encuentra "María", "MARÍA", "maría"
            <br />
            • "O.C" o "o.c" → encuentra "O.C 00491_2023", "o.c 00491_2023"
            <br />
            • "00491" → encuentra "O.C 00491_2023", "O.S 1319_2025"
            <br />
            • "2023" → encuentra "O.C 00491_2023", "EXP-2023-001"
          </p>
        </div> */}

        {/* Filtros avanzados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tipo de búsqueda</label>
            <select
              className="w-full px-3 py-2 border border-gray-400 rounded-md"
              value={filters.searchType}
              onChange={(e) => handleFilterChange('searchType', e.target.value)}
            >
              <option value="all">Todo</option>
              <option value="documents">Solo Documentos</option>
              <option value="expedientes">Solo Expedientes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Año</label>
            <select
              className="w-full px-3 py-2 border border-gray-400 rounded-md"
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
            >
              <option value="">Todos los años</option>
              {initialFilters.years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Área</label>
            <select
              className="w-full px-3 py-2 border border-gray-400 rounded-md"
              value={filters.areaId}
              onChange={(e) => handleFilterChange('areaId', e.target.value)}
            >
              <option value="">Todas las áreas</option>
              {initialFilters.areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-sm text-gray-600 mb-1">Estado del expediente</label>
            <select
              className="w-full px-3 py-2 border border-gray-400 rounded-md"
              value={filters.expedienteState}
              onChange={(e) => handleFilterChange('expedienteState', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="en_tramite">En trámite</option>
              <option value="cerrado">Cerrado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Fecha desde</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-400 rounded-md"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Fecha hasta</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-400 rounded-md"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Ordenar por</label>
            <select
              className="w-full px-3 py-2 border border-gray-400 rounded-md"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="date">Fecha</option>
              <option value="name">Nombre</option>
              <option value="expediente">Expediente</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sortOrder"
                value="desc"
                checked={filters.sortOrder === 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              />
              Descendente
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sortOrder"
                value="asc"
                checked={filters.sortOrder === 'asc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              />
              Ascendente
            </label>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-400">
          <h3 className="text-lg font-semibold">
            Resultados ({pagination.total})
            {loading && <span className="ml-2 text-sm text-gray-500">Buscando...</span>}
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0093DF] mx-auto mb-2"></div>
              Cargando resultados...
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm || Object.values(filters).some(v => v) 
                ? 'No se encontraron resultados' 
                : 'Ingresa un término de búsqueda o aplica filtros'
              }
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-gray-600">Tipo</th>
                  <th className="p-3 text-left text-gray-600">Título</th>
                  <th className="p-3 text-left text-gray-600">Descripción</th>
                  <th className="p-3 text-left text-gray-600">Fecha</th>
                  <th className="p-3 text-left text-gray-600">Área</th>
                  <th className="p-3 text-left text-gray-600">Responsable</th>
                  <th className="p-3 text-left text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b border-gray-400 hover:bg-gray-50">
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.type === 'documento' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.type === 'documento' ? '📄 Documento' : '📁 Expediente'}
                      </span>
                      
                    </td>
                    <td className="p-3 font-medium">{result.title}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {result.type === 'expediente' ? (
                        <span 
                          dangerouslySetInnerHTML={{ 
                            __html: formatExpedienteDescription(result.description, result.state) 
                          }} 
                        />
                      ) : (
                        result.description
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      <div>
                        {new Date(result.date).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {new Date(result.date).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{result.area}</td>
                    <td className="p-3 text-sm">{result.responsible}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {result.type === 'expediente' && (
                          <button
                            onClick={() => {
                              const expedienteId = parseInt(result.id.replace('exp_', ''));
                              setViewDocuments({ expedienteId, expedienteNumber: result.expedienteNumber || result.title });
                            }}
                            className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs cursor-pointer"
                            title="Ver Documentos"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {result.filePath && (
                          <button
                            onClick={() => handleDownload(result)}
                            className="px-2 py-1 bg-[#0093DF] text-white rounded-md hover:bg-blue-700 text-xs cursor-pointer"
                            title="Descargar"
                          >
                            📥
                          </button>
                        )}
                        <button
                          onClick={() => handleShare(result)}
                          className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-xs cursor-pointer"
                          title="Compartir"
                        >
                          🔗
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="p-6 border-t border-gray-400 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
          {message}
        </div>
      )}
      
      <ExpedienteDocumentsModal
        isOpen={!!viewDocuments}
        onClose={() => setViewDocuments(null)}
        expedienteId={viewDocuments?.expedienteId || 0}
        expedienteNumber={viewDocuments?.expedienteNumber || ''}
      />
    </div>
  );
};

export default AdvancedSearch;
