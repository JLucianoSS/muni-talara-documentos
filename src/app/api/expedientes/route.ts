import { NextResponse } from 'next/server';
import { getExpedientes, createExpediente, updateExpediente, deleteExpediente, hasDocumentsInExpediente } from '@/actions/expedientesActions';

export async function GET() {
  const data = await getExpedientes();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;
  
  if (action === 'getExpedientesWithDocuments') {
    const expedientes = await getExpedientes();
    const expedientesWithInfo = await Promise.all(
      expedientes.map(async (expediente) => {
        const hasDocuments = await hasDocumentsInExpediente(expediente.id);
        return {
          ...expediente,
          hasDocuments
        };
      })
    );
    return NextResponse.json(expedientesWithInfo);
  }
  
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
  
  // Verificar si el expediente tiene documentos antes de eliminar
  const hasDocuments = await hasDocumentsInExpediente(Number(id));
  if (hasDocuments) {
    return NextResponse.json({ 
      error: 'expediente_has_documents', 
      message: 'No se puede eliminar el expediente porque tiene documentos asignados' 
    }, { status: 400 });
  }
  
  await deleteExpediente(Number(id));
  return NextResponse.json({ success: true });
}
