'use server';

import { db } from '@/db';
import { expedientes, areas, users, documents } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getPeruDateTime } from '@/lib/dateUtils';

type ExpedienteInput = {
  number: string;
  state: 'en_tramite' | 'cerrado' | 'pendiente';
  responsibleUserId: number;
  areaId: number;
};

export async function getExpedientes(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  
  const results = await db
    .select({
      id: expedientes.id,
      number: expedientes.number,
      state: expedientes.state,
      createdAt: expedientes.createdAt,
      updatedAt: expedientes.updatedAt,
      responsibleUsername: users.username,
      areaName: areas.name,
    })
    .from(expedientes)
    .leftJoin(users, eq(expedientes.responsibleUserId, users.id))
    .leftJoin(areas, eq(expedientes.areaId, areas.id))
    .orderBy(desc(expedientes.id))
    .limit(limit)
    .offset(offset);

  // Contar total para paginación
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(expedientes);
  
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

export async function getAreas() {
  return await db.select().from(areas);
}

export async function getUsers() {
  return await db.select().from(users);
}

export async function createArea(name: string) {
  const [newArea] = await db
    .insert(areas)
    .values({ name })
    .returning({ id: areas.id, name: areas.name });
  revalidatePath('/dashboard/gestion-expedientes');
  revalidatePath('/dashboard/areas');
  return { id: newArea.id, name: newArea.name };
}

export async function deleteArea(id: number) {
  await db.delete(areas).where(eq(areas.id, id));
  revalidatePath('/dashboard/areas');
  revalidatePath('/dashboard/gestion-expedientes');
}

export async function createExpediente(data: ExpedienteInput) {
  const now = getPeruDateTime();
  await db.insert(expedientes).values({
    number: data.number,
    state: data.state,
    responsibleUserId: data.responsibleUserId,
    areaId: data.areaId,
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath('/dashboard/gestion-expedientes');
}

export async function updateExpediente(id: number, data: ExpedienteInput) {
  await db
    .update(expedientes)
    .set({
      number: data.number,
      state: data.state,
      responsibleUserId: data.responsibleUserId,
      areaId: data.areaId,
      updatedAt: getPeruDateTime(),
    })
    .where(eq(expedientes.id, id));
  revalidatePath('/dashboard/gestion-expedientes');
}

export async function deleteExpediente(id: number) {
  await db.delete(expedientes).where(eq(expedientes.id, id));
  revalidatePath('/dashboard/gestion-expedientes');
}

// Función para verificar si un área tiene expedientes asignados
export async function hasExpedientesInArea(areaId: number): Promise<boolean> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(expedientes)
    .where(eq(expedientes.areaId, areaId));
  
  return result[0]?.count > 0;
}

// Función para verificar si un expediente tiene documentos
export async function hasDocumentsInExpediente(expedienteId: number): Promise<boolean> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(documents)
    .where(eq(documents.expedienteId, expedienteId));
  
  return result[0]?.count > 0;
}

// --- Client-side helpers (fetch-based) ---
// Nota: helpers de fetch del lado cliente movidos a src/lib/clientApi.ts