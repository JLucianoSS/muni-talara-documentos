import { NextResponse } from 'next/server';
import { uploadToImageKit } from '@/lib/imagekit';

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get('file') as File | null;
  const expedienteId = form.get('expedienteId') as string | null;

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const fileName = file.name;

  try {
    const res = await uploadToImageKit(arrayBuffer, fileName, `/expedientes/${expedienteId || 'general'}`);
    return NextResponse.json({ url: res.url, fileId: res.fileId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 });
  }
}
