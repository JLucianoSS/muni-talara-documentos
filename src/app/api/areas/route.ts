import { NextResponse } from 'next/server';
import { getAreas, createArea, deleteArea } from '@/actions/expedientesActions';

export async function GET() {
  const data = await getAreas();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = body.name;
  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });
  const id = await createArea(name);
  return NextResponse.json({ id });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  await deleteArea(Number(id));
  return NextResponse.json({ success: true });
}