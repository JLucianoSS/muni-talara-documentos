'use server';

import { db } from '@/db';
import { expedientes, areas, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type ExpedienteInput = {
  number: string;
  state: 'en_tramite' | 'cerrado' | 'pendiente';
  responsibleUserId: number;
  areaName: string; // Cambiado de areaId a areaName
};

export async function getExpedientes() {
  return await db
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
    .leftJoin(areas, eq(expedientes.areaId, areas.id));
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
    .returning({ id: areas.id });
  revalidatePath('/dashboard/gestion-expedientes');
  revalidatePath('/dashboard/areas');
  return newArea.id;
}

export async function deleteArea(id: number) {
  await db.delete(areas).where(eq(areas.id, id));
  revalidatePath('/dashboard/areas');
  revalidatePath('/dashboard/gestion-expedientes');
}

export async function createExpediente(data: ExpedienteInput) {
  // Buscar o crear el área
  let areaId: number;
  const [existingArea] = await db
    .select({ id: areas.id })
    .from(areas)
    .where(eq(areas.name, data.areaName))
    .limit(1);

  if (existingArea) {
    areaId = existingArea.id;
  } else {
    areaId = await createArea(data.areaName);
  }

  await db.insert(expedientes).values({
    number: data.number,
    state: data.state,
    responsibleUserId: data.responsibleUserId,
    areaId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  revalidatePath('/dashboard/gestion-expedientes');
}

export async function updateExpediente(id: number, data: ExpedienteInput) {
  // Buscar o crear el área
  let areaId: number;
  const [existingArea] = await db
    .select({ id: areas.id })
    .from(areas)
    .where(eq(areas.name, data.areaName))
    .limit(1);

  if (existingArea) {
    areaId = existingArea.id;
  } else {
    areaId = await createArea(data.areaName);
  }

  await db
    .update(expedientes)
    .set({
      number: data.number,
      state: data.state,
      responsibleUserId: data.responsibleUserId,
      areaId,
      updatedAt: new Date(),
    })
    .where(eq(expedientes.id, id));
  revalidatePath('/dashboard/gestion-expedientes');
}

export async function deleteExpediente(id: number) {
  await db.delete(expedientes).where(eq(expedientes.id, id));
  revalidatePath('/dashboard/gestion-expedientes');
}

// --- Client-side helpers (fetch-based) ---
// Nota: helpers de fetch del lado cliente movidos a src/lib/clientApi.ts