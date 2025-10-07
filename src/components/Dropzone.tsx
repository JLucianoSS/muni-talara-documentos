'use client';

import { useCallback, useState } from 'react';

type DropzoneProps = {
  expedienteId?: number;
  onUpload?: (url: string) => void;
};

export const Dropzone = ({ expedienteId, onUpload }: DropzoneProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const form = new FormData();
    form.append('file', file);
    if (expedienteId) form.append('expedienteId', String(expedienteId));
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/documents/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        onUpload?.(data.url);
      } else {
        setError(data.error || 'upload_error');
      }
    } catch (e) {
      setError('network_error');
    } finally {
      setLoading(false);
    }
  }, [expedienteId, onUpload]);

  return (
    <div className="border-2 border-dashed p-4 rounded-md">
      <input
        type="file"
        onChange={(e) => handleFiles(e.target.files)}
        className="w-full"
      />
      {loading && <p className="text-sm text-gray-500">Subiendo...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Dropzone;
