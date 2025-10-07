import { NextResponse } from 'next/server';
import { getExpedientes, createExpediente, updateExpediente, deleteExpediente } from '@/actions/expedientesActions';

export async function GET() {
  const data = await getExpedientes();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  await createExpediente(body);
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  await updateExpediente(Number(id), data);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  await deleteExpediente(Number(id));
  return NextResponse.json({ success: true });
}
