'use server';

import { db } from '@/db';
import { documents, areas, users, expedientes } from '@/db/schema';
import { eq, and, or, like, gte, lte, desc, asc, sql } from 'drizzle-orm';

export type SearchFilters = {
  term?: string; // Búsqueda por término
  year?: number; // Filtro por año
  areaId?: number; // Filtro por área
  documentType?: string; // Tipo de documento
  expedienteState?: string; // Estado del expediente
  dateFrom?: string; // Fecha desde (ISO)
  dateTo?: string; // Fecha hasta (ISO)
  sortBy?: 'date' | 'name' | 'expediente'; // Ordenamiento
  sortOrder?: 'asc' | 'desc'; // Dirección del ordenamiento
  page?: number; // Página (para paginación)
  limit?: number; // Límite por página
};

export type SearchResult = {
  id: string; // Prefijo + ID para distinguir tipo
  type: 'expediente' | 'documento';
  title: string;
  description: string;
  date: Date;
  area: string;
  responsible: string;
  expedienteNumber?: string;
  documentName?: string;
  documentType?: string;
  filePath?: string;
  state?: string;
};

export async function searchDocuments(filters: SearchFilters) {
  const {
    term = '',
    year,
    areaId,
    documentType,
    expedienteState,
    dateFrom,
    dateTo,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = filters;

  // Construir condiciones WHERE
  const conditions = [];

  // Búsqueda por término
  if (term) {
    conditions.push(
      or(
        like(documents.name, `%${term}%`),
        like(expedientes.number, `%${term}%`),
        like(users.username, `%${term}%`)
      )
    );
  }

  // Filtro por año
  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    conditions.push(
      and(
        gte(documents.date, startDate),
        lte(documents.date, endDate)
      )
    );
  }

  // Filtro por área
  if (areaId) {
    conditions.push(eq(documents.areaId, areaId));
  }

  // Filtro por tipo de documento
  if (documentType) {
    conditions.push(eq(documents.type, documentType as any));
  }

  // Filtro por estado de expediente
  if (expedienteState) {
    conditions.push(eq(expedientes.state, expedienteState as any));
  }

  // Filtro por rango de fechas
  if (dateFrom) {
    conditions.push(gte(documents.date, new Date(dateFrom)));
  }
  if (dateTo) {
    conditions.push(lte(documents.date, new Date(dateTo)));
  }

  // Ordenamiento
  const orderBy = sortOrder === 'asc' ? asc : desc;
  let orderColumn;
  switch (sortBy) {
    case 'name':
      orderColumn = documents.name;
      break;
    case 'expediente':
      orderColumn = expedientes.number;
      break;
    default:
      orderColumn = documents.date;
  }

  // Query principal
  const offset = (page - 1) * limit;
  
  const results = await db
    .select({
      id: documents.id,
      name: documents.name,
      type: documents.type,
      date: documents.date,
      filePath: documents.filePath,
      expedienteId: documents.expedienteId,
      expedienteNumber: expedientes.number,
      expedienteState: expedientes.state,
      areaName: areas.name,
      responsibleUsername: users.username,
    })
    .from(documents)
    .leftJoin(expedientes, eq(documents.expedienteId, expedientes.id))
    .leftJoin(areas, eq(documents.areaId, areas.id))
    .leftJoin(users, eq(documents.responsibleUserId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy(orderColumn))
    .limit(limit)
    .offset(offset);

  // Contar total para paginación
  const allResults = await db
    .select({
      id: documents.id,
      name: documents.name,
      type: documents.type,
      date: documents.date,
      filePath: documents.filePath,
      expedienteId: documents.expedienteId,
      expedienteNumber: expedientes.number,
      expedienteState: expedientes.state,
      areaName: areas.name,
      responsibleUsername: users.username,
    })
    .from(documents)
    .leftJoin(expedientes, eq(documents.expedienteId, expedientes.id))
    .leftJoin(areas, eq(documents.areaId, areas.id))
    .leftJoin(users, eq(documents.responsibleUserId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = allResults.length;

  // Transformar resultados
  const searchResults: SearchResult[] = results.map(doc => ({
    id: `doc_${doc.id}`,
    type: 'documento' as const,
    title: doc.name,
    description: `Documento ${doc.type} del expediente ${doc.expedienteNumber}`,
    date: doc.date,
    area: doc.areaName || '',
    responsible: doc.responsibleUsername || '',
    expedienteNumber: doc.expedienteNumber,
    documentName: doc.name,
    documentType: doc.type,
    filePath: doc.filePath,
    state: doc.expedienteState,
  }));

  return {
    results: searchResults,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function searchExpedientes(filters: SearchFilters) {
  const {
    term = '',
    year,
    areaId,
    expedienteState,
    dateFrom,
    dateTo,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = filters;

  const conditions = [];

  // Búsqueda por término
  if (term) {
    conditions.push(
      or(
        like(expedientes.number, `%${term}%`),
        like(users.username, `%${term}%`)
      )
    );
  }

  // Filtro por año
  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    conditions.push(
      and(
        gte(expedientes.createdAt, startDate),
        lte(expedientes.createdAt, endDate)
      )
    );
  }

  // Filtro por área
  if (areaId) {
    conditions.push(eq(expedientes.areaId, areaId));
  }

  // Filtro por estado
  if (expedienteState) {
    conditions.push(eq(expedientes.state, expedienteState as any));
  }

  // Filtro por rango de fechas
  if (dateFrom) {
    conditions.push(gte(expedientes.createdAt, new Date(dateFrom)));
  }
  if (dateTo) {
    conditions.push(lte(expedientes.createdAt, new Date(dateTo)));
  }

  // Ordenamiento
  const orderBy = sortOrder === 'asc' ? asc : desc;
  let orderColumn;
  switch (sortBy) {
    case 'name':
      orderColumn = expedientes.number;
      break;
    default:
      orderColumn = expedientes.createdAt;
  }

  const offset = (page - 1) * limit;
  
  const results = await db
    .select({
      id: expedientes.id,
      number: expedientes.number,
      state: expedientes.state,
      createdAt: expedientes.createdAt,
      areaName: areas.name,
      responsibleUsername: users.username,
    })
    .from(expedientes)
    .leftJoin(areas, eq(expedientes.areaId, areas.id))
    .leftJoin(users, eq(expedientes.responsibleUserId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy(orderColumn))
    .limit(limit)
    .offset(offset);

  // Contar total
  const allResults = await db
    .select({
      id: expedientes.id,
      number: expedientes.number,
      state: expedientes.state,
      createdAt: expedientes.createdAt,
      areaName: areas.name,
      responsibleUsername: users.username,
    })
    .from(expedientes)
    .leftJoin(areas, eq(expedientes.areaId, areas.id))
    .leftJoin(users, eq(expedientes.responsibleUserId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = allResults.length;

  const searchResults: SearchResult[] = results.map(exp => ({
    id: `exp_${exp.id}`,
    type: 'expediente' as const,
    title: exp.number,
    description: `Expediente ${exp.state} - ${exp.areaName}`,
    date: exp.createdAt,
    area: exp.areaName || '',
    responsible: exp.responsibleUsername || '',
    expedienteNumber: exp.number,
    state: exp.state,
  }));

  return {
    results: searchResults,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getSearchFilters() {
  const areasList = await db.select().from(areas);
  
  // Obtener años únicos de documentos
  const documentsWithYears = await db
    .select({ date: documents.date })
    .from(documents);
  
  const years = [...new Set(documentsWithYears.map(doc => new Date(doc.date).getFullYear()))]
    .sort((a, b) => b - a); // Ordenar descendentemente
  
  return {
    areas: areasList,
    years: years.length > 0 ? years : [2025] // Si no hay documentos, mostrar solo 2025
  };
}
