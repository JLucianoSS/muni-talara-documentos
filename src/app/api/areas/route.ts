import { NextResponse } from 'next/server';
import { getAreas, createArea, deleteArea, hasExpedientesInArea } from '@/actions/expedientesActions';

export async function GET() {
  const data = await getAreas();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, name } = body;
  
  if (action === 'getAreasWithExpedientes') {
    const areas = await getAreas();
    const areasWithInfo = await Promise.all(
      areas.map(async (area) => {
        const hasExpedientes = await hasExpedientesInArea(area.id);
        return {
          ...area,
          hasExpedientes
        };
      })
    );
    return NextResponse.json(areasWithInfo);
  }
  
  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });
  const id = await createArea(name);
  return NextResponse.json({ id });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  
  // Verificar si el área tiene expedientes antes de eliminar
  const hasExpedientes = await hasExpedientesInArea(Number(id));
  if (hasExpedientes) {
    return NextResponse.json({ 
      error: 'area_has_expedientes', 
      message: 'No se puede eliminar el área porque tiene expedientes asignados' 
    }, { status: 400 });
  }
  
  await deleteArea(Number(id));
  return NextResponse.json({ success: true });
}