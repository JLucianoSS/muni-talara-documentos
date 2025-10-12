import { NextResponse } from 'next/server';
import { getDocuments, createDocument, updateDocument, deleteDocument, getDocumentsByExpediente, getDeletedDocuments } from '@/actions/documentsActions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const expedienteId = searchParams.get('expedienteId');
  const deleted = searchParams.get('deleted');
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  
  if (expedienteId) {
    const data = await getDocumentsByExpediente(Number(expedienteId));
    return NextResponse.json(data);
  }
  
  if (deleted === 'true') {
    const data = await getDeletedDocuments(page, limit);
    return NextResponse.json(data);
  }
  
  const data = await getDocuments(page, limit);
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


