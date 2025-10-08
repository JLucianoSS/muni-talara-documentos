// Implementación ligera que usa la API REST de ImageKit para subir archivos.
// Requiere definir IMAGEKIT_PRIVATE_KEY y IMAGEKIT_PUBLIC_KEY en .env (server-only).
import { Buffer } from 'buffer';

const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const DEFAULT_FOLDER = "/mi-carpeta";

export async function uploadToImageKit(buffer: ArrayBuffer, fileName: string, folder: string  = DEFAULT_FOLDER) {
  const base64 = Buffer.from(buffer).toString('base64');
  const form = new FormData();
  form.append('file', `data:application/octet-stream;base64,${base64}`);
  form.append('fileName', fileName);
  if (folder) form.append('folder', folder);

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) throw new Error('IMAGEKIT_PRIVATE_KEY not set');

  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(privateKey + ':').toString('base64')}`,
    },
    body: form as FormData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`upload_failed: ${text}`);
  }

  return res.json();
}

export default { uploadToImageKit };
