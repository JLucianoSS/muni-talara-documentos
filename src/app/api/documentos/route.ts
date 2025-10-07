import { NextResponse } from 'next/server';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '@/actions/documentsActions';

export async function GET() {
  const data = await getDocuments();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  await createDocument(body);
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...data } = body;
  await updateDocument(Number(id), data);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  await deleteDocument(Number(id));
  return NextResponse.json({ success: true });
}


