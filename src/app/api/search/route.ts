import { NextResponse } from 'next/server';
import { searchDocuments, searchExpedientes, getSearchFilters } from '@/actions/searchActions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchType = searchParams.get('searchType') || searchParams.get('type') || 'all';
  
  const filters = {
    term: searchParams.get('term') || undefined,
    year: searchParams.get('year') ? Number(searchParams.get('year')) : undefined,
    areaId: searchParams.get('areaId') ? Number(searchParams.get('areaId')) : undefined,
    expedienteState: searchParams.get('expedienteState') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    sortBy: (searchParams.get('sortBy') as 'date' | 'name' | 'expediente') || 'date',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
  };

  try {
    let results;
    
    if (searchType === 'documents') {
      results = await searchDocuments(filters);
    } else if (searchType === 'expedientes') {
      results = await searchExpedientes(filters);
    } else {
      // Búsqueda combinada
      const [docResults, expResults] = await Promise.all([
        searchDocuments(filters),
        searchExpedientes(filters)
      ]);
      
      // Combinar y ordenar resultados
      const combinedResults = [...docResults.results, ...expResults.results]
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
      
      results = {
        results: combinedResults,
        total: docResults.total + expResults.total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil((docResults.total + expResults.total) / filters.limit)
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'search_failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type = 'filters' } = body;

  try {
    if (type === 'filters') {
      const filters = await getSearchFilters();
      return NextResponse.json(filters);
    }
    
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  } catch (error) {
    console.error('Filters error:', error);
    return NextResponse.json({ error: 'filters_failed' }, { status: 500 });
  }
}
