import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida en .env.local');
  }

  const username = process.env.SEED_USERNAME || 'admin';
  const password = process.env.SEED_PASSWORD || 'defaultPassword123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Verificar si el usuario ya existe
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUser.length > 0) {
    console.log(`El usuario '${username}' ya existe. Actualizando contraseña...`);
    // Opcional: Actualizar la contraseña del usuario existente
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, username));
    console.log(`Contraseña actualizada para el usuario '${username}'.`);
  } else {
    // Insertar nuevo usuario
    await db.insert(users).values({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });
    console.log(`Usuario inicial creado: '${username}'`);
  }
}

seed().catch((error) => {
  console.error('Error ejecutando seed:', error);
  process.exit(1);
});