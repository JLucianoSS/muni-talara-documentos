import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { setCookie } from 'cookies-next';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Buscar usuario
    const [user] = await db
      .select({ id: users.id, username: users.username, password: users.password })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Establecer cookie
    const response = NextResponse.json({ id: user.id, username: user.username });
    setCookie('userSession', JSON.stringify({ id: user.id, username: user.username }), {
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: '/',
      httpOnly: false, // Accesible en cliente para demo
      secure: process.env.NODE_ENV === 'production',
      res: response,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}