'use server';

import { db } from '@/db';
import { documents, areas, users, expedientes } from '@/db/schema';
import { eq, desc, isNull, isNotNull, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { fromDateTimeString, getPeruDateTime } from '@/lib/dateUtils';

export type DocumentInput = {
  expedienteId: number;
  name: string; // Nombre del documento
  date: string; // ISO
  filePath: string; // URL de ImageKit
};

export async function getDocuments(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  
  const results = await db
    .select({
      id: documents.id,
      expedienteId: documents.expedienteId,
      name: documents.name,
      date: documents.date,
      filePath: documents.filePath,
      responsibleUsername: users.username,
      areaName: areas.name,
      expedienteNumber: expedientes.number,
    })
    .from(documents)
    .leftJoin(users, eq(documents.responsibleUserId, users.id))
    .leftJoin(areas, eq(documents.areaId, areas.id))
    .leftJoin(expedientes, eq(documents.expedienteId, expedientes.id))
    .where(isNull(documents.deletedAt)) // Solo documentos no eliminados
    .orderBy(desc(documents.id))
    .limit(limit)
    .offset(offset);

  // Contar total para paginación
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(documents)
    .where(isNull(documents.deletedAt));
  
  const total = totalResult[0]?.count || 0;

  return {
    data: results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function createDocument(data: DocumentInput) {
  // Obtener el expediente para extraer área y responsable
  const [expediente] = await db
    .select({
      responsibleUserId: expedientes.responsibleUserId,
      areaId: expedientes.areaId,
    })
    .from(expedientes)
    .where(eq(expedientes.id, data.expedienteId))
    .limit(1);

  if (!expediente) {
    throw new Error('Expediente no encontrado');
  }

  // Crear el documento
  await db.insert(documents).values({
    expedienteId: data.expedienteId,
    name: data.name,
    date: fromDateTimeString(data.date),
    responsibleUserId: expediente.responsibleUserId,
    areaId: expediente.areaId,
    filePath: data.filePath,
  });

  // Actualizar la fecha de actualización del expediente
  await db
    .update(expedientes)
    .set({ updatedAt: fromDateTimeString(data.date) })
    .where(eq(expedientes.id, data.expedienteId));

  revalidatePath('/dashboard/registro-documentos');
  revalidatePath('/dashboard/gestion-expedientes');
}

export async function updateDocument(id: number, data: DocumentInput) {
  // Obtener el expediente para extraer área y responsable
  const [expediente] = await db
    .select({
      responsibleUserId: expedientes.responsibleUserId,
      areaId: expedientes.areaId,
    })
    .from(expedientes)
    .where(eq(expedientes.id, data.expedienteId))
    .limit(1);

  if (!expediente) {
    throw new Error('Expediente no encontrado');
  }

  // Actualizar el documento
  await db
    .update(documents)
    .set({
      expedienteId: data.expedienteId,
      name: data.name,
      date: fromDateTimeString(data.date),
      responsibleUserId: expediente.responsibleUserId,
      areaId: expediente.areaId,
      filePath: data.filePath,
    })
    .where(eq(documents.id, id));

  // Actualizar la fecha de actualización del expediente
  await db
    .update(expedientes)
    .set({ updatedAt: fromDateTimeString(data.date) })
    .where(eq(expedientes.id, data.expedienteId));

  revalidatePath('/dashboard/registro-documentos');
  revalidatePath('/dashboard/gestion-expedientes');
}

export async function deleteDocument(id: number) {
  // Obtener el expedienteId antes de eliminar el documento
  const [document] = await db
    .select({ expedienteId: documents.expedienteId })
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  // Soft delete: marcar como eliminado en lugar de eliminar permanentemente
  await db
    .update(documents)
    .set({ deletedAt: getPeruDateTime() })
    .where(eq(documents.id, id));

  // Actualizar la fecha de actualización del expediente si existe
  if (document) {
    await db
      .update(expedientes)
      .set({ updatedAt: getPeruDateTime() })
      .where(eq(expedientes.id, document.expedienteId));
  }

  revalidatePath('/dashboard/registro-documentos');
  revalidatePath('/dashboard/gestion-expedientes');
}

export async function getDocumentsByExpediente(expedienteId: number) {
  return await db
    .select({
      id: documents.id,
      expedienteId: documents.expedienteId,
      name: documents.name,
      date: documents.date,
      filePath: documents.filePath,
      responsibleUsername: users.username,
      areaName: areas.name,
      expedienteNumber: expedientes.number,
    })
    .from(documents)
    .leftJoin(users, eq(documents.responsibleUserId, users.id))
    .leftJoin(areas, eq(documents.areaId, areas.id))
    .leftJoin(expedientes, eq(documents.expedienteId, expedientes.id))
    .where(eq(documents.expedienteId, expedienteId))
    .where(isNull(documents.deletedAt)) // Solo documentos no eliminados
    .orderBy(desc(documents.date));
}

// Funciones para la papelera
export async function getDeletedDocuments(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  
  const results = await db
    .select({
      id: documents.id,
      expedienteId: documents.expedienteId,
      name: documents.name,
      date: documents.date,
      filePath: documents.filePath,
      deletedAt: documents.deletedAt,
      responsibleUsername: users.username,
      areaName: areas.name,
      expedienteNumber: expedientes.number,
    })
    .from(documents)
    .leftJoin(users, eq(documents.responsibleUserId, users.id))
    .leftJoin(areas, eq(documents.areaId, areas.id))
    .leftJoin(expedientes, eq(documents.expedienteId, expedientes.id))
    .where(isNotNull(documents.deletedAt)) // Solo documentos eliminados
    .orderBy(desc(documents.deletedAt))
    .limit(limit)
    .offset(offset);

  // Contar total para paginación
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(documents)
    .where(isNotNull(documents.deletedAt));
  
  const total = totalResult[0]?.count || 0;

  return {
    data: results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function restoreDocument(id: number) {
  await db
    .update(documents)
    .set({ deletedAt: null })
    .where(eq(documents.id, id));

  revalidatePath('/dashboard/papelera');
  revalidatePath('/dashboard/registro-documentos');
  revalidatePath('/dashboard/gestion-expedientes');
}

export async function permanentlyDeleteDocument(id: number) {
  // Obtener el expedienteId antes de eliminar el documento
  const [document] = await db
    .select({ expedienteId: documents.expedienteId })
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  // Eliminar permanentemente el documento
  await db.delete(documents).where(eq(documents.id, id));

  // Actualizar la fecha de actualización del expediente si existe
  if (document) {
    await db
      .update(expedientes)
      .set({ updatedAt: getPeruDateTime() })
      .where(eq(expedientes.id, document.expedienteId));
  }

  revalidatePath('/dashboard/papelera');
  revalidatePath('/dashboard/registro-documentos');
  revalidatePath('/dashboard/gestion-expedientes');
}


