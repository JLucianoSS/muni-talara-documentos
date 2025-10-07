'use server';

import { db } from '@/db';
import { documents, areas, users, expedientes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type DocumentInput = {
  expedienteId: number;
  name: string; // Nombre del documento
  type: 'PDF' | 'Word' | 'Excel' | 'Otro';
  date: string; // ISO
  filePath: string; // URL de ImageKit
};

export async function getDocuments() {
  return await db
    .select({
      id: documents.id,
      expedienteId: documents.expedienteId,
      name: documents.name,
      type: documents.type,
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

  await db.insert(documents).values({
    expedienteId: data.expedienteId,
    name: data.name,
    type: data.type,
    date: new Date(data.date),
    responsibleUserId: expediente.responsibleUserId,
    areaId: expediente.areaId,
    filePath: data.filePath,
  });
  revalidatePath('/dashboard/registro-documentos');
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

  await db
    .update(documents)
    .set({
      expedienteId: data.expedienteId,
      name: data.name,
      type: data.type,
      date: new Date(data.date),
      responsibleUserId: expediente.responsibleUserId,
      areaId: expediente.areaId,
      filePath: data.filePath,
    })
    .where(eq(documents.id, id));
  revalidatePath('/dashboard/registro-documentos');
}

export async function deleteDocument(id: number) {
  await db.delete(documents).where(eq(documents.id, id));
  revalidatePath('/dashboard/registro-documentos');
}


