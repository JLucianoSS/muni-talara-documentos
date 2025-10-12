'use server';

import { db } from '@/db';
import { documents, areas, users, expedientes } from '@/db/schema';
import { eq, and, or, like, gte, lte, desc, asc, sql, isNull, ilike } from 'drizzle-orm';
import { getExpedienteStateInfo } from '@/lib/expedienteUtils';
import { fromDateString } from '@/lib/dateUtils';
import { normalizeText } from '@/lib/searchUtils';

export type SearchFilters = {
  term?: string; // Búsqueda por término
  year?: number; // Filtro por año
  areaId?: number; // Filtro por área
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
  expedienteNumber?: string | null;
  documentName?: string;
  filePath?: string;
  state?: string | null;
};

export async function searchDocuments(filters: SearchFilters) {
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

  // Construir condiciones WHERE
  const conditions = [];

  // Siempre excluir documentos eliminados
  conditions.push(isNull(documents.deletedAt));

  // Búsqueda por término (flexible - insensible a mayúsculas, tildes y caracteres especiales)
  if (term) {
    const normalizedTerm = normalizeText(term);
    const originalTerm = term.toLowerCase();
    
    conditions.push(
      or(
        // Búsqueda normalizada (sin tildes, puntos, guiones)
        sql`LOWER(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(${documents.name}, '[áàäâ]', 'a', 'g'), '[éèëê]', 'e', 'g'), '[íìïî]', 'i', 'g'), '[óòöô]', 'o', 'g'), '[úùüû]', 'u', 'g'), '[ñ]', 'n', 'g'), '[ç]', 'c', 'g'), '[._-]', ' ', 'g'), '\\s+', ' ', 'g')) LIKE ${'%' + normalizedTerm + '%'}`,
        sql`LOWER(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(${expedientes.number}, '[áàäâ]', 'a', 'g'), '[éèëê]', 'e', 'g'), '[íìïî]', 'i', 'g'), '[óòöô]', 'o', 'g'), '[úùüû]', 'u', 'g'), '[ñ]', 'n', 'g'), '[ç]', 'c', 'g'), '[._-]', ' ', 'g'), '\\s+', ' ', 'g')) LIKE ${'%' + normalizedTerm + '%'}`,
        sql`LOWER(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(${users.username}, '[áàäâ]', 'a', 'g'), '[éèëê]', 'e', 'g'), '[íìïî]', 'i', 'g'), '[óòöô]', 'o', 'g'), '[úùüû]', 'u', 'g'), '[ñ]', 'n', 'g'), '[ç]', 'c', 'g'), '[._-]', ' ', 'g'), '\\s+', ' ', 'g')) LIKE ${'%' + normalizedTerm + '%'}`,
        
        // Búsqueda original (para casos como "O.C" encontrando "O.C 00491_2023")
        sql`LOWER(${documents.name}) LIKE ${'%' + originalTerm + '%'}`,
        sql`LOWER(${expedientes.number}) LIKE ${'%' + originalTerm + '%'}`,
        sql`LOWER(${users.username}) LIKE ${'%' + originalTerm + '%'}`
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


  // Filtro por estado de expediente
  if (expedienteState) {
    conditions.push(eq(expedientes.state, expedienteState as 'en_tramite' | 'cerrado' | 'pendiente'));
  }

  // Filtro por rango de fechas (considerando horas completas del día en zona horaria de Perú)
  if (dateFrom) {
    const startDate = fromDateString(dateFrom);
    startDate.setHours(0, 0, 0, 0); // Inicio del día
    conditions.push(gte(documents.date, startDate));
  }
  if (dateTo) {
    const endDate = fromDateString(dateTo);
    endDate.setHours(23, 59, 59, 999); // Final del día
    conditions.push(lte(documents.date, endDate));
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
    description: `Documento del expediente ${doc.expedienteNumber || 'N/A'}`,
    date: doc.date,
    area: doc.areaName || '',
    responsible: doc.responsibleUsername || '',
    expedienteNumber: doc.expedienteNumber,
    documentName: doc.name,
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

  // Búsqueda por término (flexible - insensible a mayúsculas, tildes y caracteres especiales)
  if (term) {
    const normalizedTerm = normalizeText(term);
    const originalTerm = term.toLowerCase();
    
    conditions.push(
      or(
        // Búsqueda normalizada (sin tildes, puntos, guiones)
        sql`LOWER(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(${expedientes.number}, '[áàäâ]', 'a', 'g'), '[éèëê]', 'e', 'g'), '[íìïî]', 'i', 'g'), '[óòöô]', 'o', 'g'), '[úùüû]', 'u', 'g'), '[ñ]', 'n', 'g'), '[ç]', 'c', 'g'), '[._-]', ' ', 'g'), '\\s+', ' ', 'g')) LIKE ${'%' + normalizedTerm + '%'}`,
        sql`LOWER(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(${users.username}, '[áàäâ]', 'a', 'g'), '[éèëê]', 'e', 'g'), '[íìïî]', 'i', 'g'), '[óòöô]', 'o', 'g'), '[úùüû]', 'u', 'g'), '[ñ]', 'n', 'g'), '[ç]', 'c', 'g'), '[._-]', ' ', 'g'), '\\s+', ' ', 'g')) LIKE ${'%' + normalizedTerm + '%'}`,
        
        // Búsqueda original (para casos como "O.C" encontrando "O.C 00491_2023")
        sql`LOWER(${expedientes.number}) LIKE ${'%' + originalTerm + '%'}`,
        sql`LOWER(${users.username}) LIKE ${'%' + originalTerm + '%'}`
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
    conditions.push(eq(expedientes.state, expedienteState as 'en_tramite' | 'cerrado' | 'pendiente'));
  }

  // Filtro por rango de fechas (considerando horas completas del día en zona horaria de Perú)
  if (dateFrom) {
    const startDate = fromDateString(dateFrom);
    startDate.setHours(0, 0, 0, 0); // Inicio del día
    conditions.push(gte(expedientes.createdAt, startDate));
  }
  if (dateTo) {
    const endDate = fromDateString(dateTo);
    endDate.setHours(23, 59, 59, 999); // Final del día
    conditions.push(lte(expedientes.createdAt, endDate));
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

  const searchResults: SearchResult[] = results.map(exp => {
    const stateInfo = getExpedienteStateInfo(exp.state as 'en_tramite' | 'cerrado' | 'pendiente');
    return {
      id: `exp_${exp.id}`,
      type: 'expediente' as const,
      title: exp.number,
      description: `Expediente ${stateInfo.label} - ${exp.areaName}`,
      date: exp.createdAt,
      area: exp.areaName || '',
      responsible: exp.responsibleUsername || '',
      expedienteNumber: exp.number,
      state: exp.state,
    };
  });

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
  
  // Obtener años únicos de documentos (solo los no eliminados)
  const documentsWithYears = await db
    .select({ date: documents.date })
    .from(documents)
    .where(isNull(documents.deletedAt));
  
  const years = [...new Set(documentsWithYears.map(doc => new Date(doc.date).getFullYear()))]
    .sort((a, b) => b - a); // Ordenar descendentemente
  
  // Si no hay documentos, incluir al menos el año actual y algunos años anteriores
  const currentYear = new Date().getFullYear();
  const defaultYears = [];
  for (let year = currentYear; year >= currentYear - 10; year--) {
    defaultYears.push(year);
  }
  
  return {
    areas: areasList,
    years: years.length > 0 ? years : defaultYears
  };
}
