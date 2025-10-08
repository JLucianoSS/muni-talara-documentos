'use server';

import { db } from '@/db';
import { documents, areas, users, expedientes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { fromDateTimeString, getPeruDateTime } from '@/lib/dateUtils';

export type DocumentInput = {
  expedienteId: number;
  name: string; // Nombre del documento
  date: string; // ISO
  filePath: string; // URL de ImageKit
};

export async function getDocuments() {
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
    .orderBy(desc(documents.id));
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

  // Eliminar el documento
  await db.delete(documents).where(eq(documents.id, id));

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
    .orderBy(desc(documents.date));
}


