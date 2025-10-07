'use server';

import { db } from '@/db';
import { documents, areas, users, expedientes } from '@/db/schema';
import { eq, sql, desc, count } from 'drizzle-orm';

export type ReportStats = {
  totalDocuments: number;
  totalExpedientes: number;
  documentsByType: Array<{ type: string; count: number }>;
  expedientesByState: Array<{ state: string; count: number }>;
  documentsByArea: Array<{ areaName: string; count: number }>;
  expedientesByArea: Array<{ areaName: string; count: number }>;
  recentDocuments: Array<{
    id: number;
    name: string;
    type: string;
    date: Date;
    expedienteNumber: string;
    areaName: string;
  }>;
  recentExpedientes: Array<{
    id: number;
    number: string;
    state: string;
    createdAt: Date;
    areaName: string;
  }>;
  monthlyStats: Array<{
    month: string;
    documents: number;
    expedientes: number;
  }>;
};

export async function getReportStats(): Promise<ReportStats> {
  // Total de documentos
  const [totalDocsResult] = await db
    .select({ count: count() })
    .from(documents);
  const totalDocuments = totalDocsResult?.count || 0;

  // Total de expedientes
  const [totalExpResult] = await db
    .select({ count: count() })
    .from(expedientes);
  const totalExpedientes = totalExpResult?.count || 0;

  // Documentos por tipo
  const docsByType = await db
    .select({
      type: documents.type,
      count: count()
    })
    .from(documents)
    .groupBy(documents.type);

  // Expedientes por estado
  const expByState = await db
    .select({
      state: expedientes.state,
      count: count()
    })
    .from(expedientes)
    .groupBy(expedientes.state);

  // Documentos por área
  const docsByArea = await db
    .select({
      areaName: areas.name,
      count: count()
    })
    .from(documents)
    .leftJoin(areas, eq(documents.areaId, areas.id))
    .groupBy(areas.name);

  // Expedientes por área
  const expByArea = await db
    .select({
      areaName: areas.name,
      count: count()
    })
    .from(expedientes)
    .leftJoin(areas, eq(expedientes.areaId, areas.id))
    .groupBy(areas.name);

  // Documentos recientes
  const recentDocuments = await db
    .select({
      id: documents.id,
      name: documents.name,
      type: documents.type,
      date: documents.date,
      expedienteNumber: expedientes.number,
      areaName: areas.name,
    })
    .from(documents)
    .leftJoin(expedientes, eq(documents.expedienteId, expedientes.id))
    .leftJoin(areas, eq(documents.areaId, areas.id))
    .orderBy(desc(documents.date))
    .limit(5);

  // Expedientes recientes
  const recentExpedientes = await db
    .select({
      id: expedientes.id,
      number: expedientes.number,
      state: expedientes.state,
      createdAt: expedientes.createdAt,
      areaName: areas.name,
    })
    .from(expedientes)
    .leftJoin(areas, eq(expedientes.areaId, areas.id))
    .orderBy(desc(expedientes.createdAt))
    .limit(5);

  // Estadísticas mensuales (últimos 6 meses)
  const monthlyStats = await db
    .select({
      month: sql<string>`TO_CHAR(${documents.date}, 'YYYY-MM')`,
      count: count()
    })
    .from(documents)
    .where(sql`${documents.date} >= NOW() - INTERVAL '6 months'`)
    .groupBy(sql`TO_CHAR(${documents.date}, 'YYYY-MM')`)
    .orderBy(sql`TO_CHAR(${documents.date}, 'YYYY-MM')`);

  return {
    totalDocuments,
    totalExpedientes,
    documentsByType: docsByType.map(d => ({ type: d.type, count: d.count })),
    expedientesByState: expByState.map(e => ({ state: e.state, count: e.count })),
    documentsByArea: docsByArea.map(d => ({ areaName: d.areaName || 'Sin área', count: d.count })),
    expedientesByArea: expByArea.map(e => ({ areaName: e.areaName || 'Sin área', count: e.count })),
    recentDocuments: recentDocuments.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      date: d.date,
      expedienteNumber: d.expedienteNumber || '',
      areaName: d.areaName || '',
    })),
    recentExpedientes: recentExpedientes.map(e => ({
      id: e.id,
      number: e.number,
      state: e.state,
      createdAt: e.createdAt,
      areaName: e.areaName || '',
    })),
    monthlyStats: monthlyStats.map(m => ({
      month: m.month,
      documents: m.count,
      expedientes: 0 // Por simplicidad, solo documentos por ahora
    }))
  };
}
