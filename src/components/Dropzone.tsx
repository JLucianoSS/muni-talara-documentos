'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';

type DropzoneProps = {
  expedienteId?: number;
  onUpload?: (url: string) => void;
  onFileTypeError?: (error: string) => void;
};

// Tipos de archivo permitidos
const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
};

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];

export const Dropzone = ({ expedienteId, onUpload, onFileTypeError }: DropzoneProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFileType = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    // Verificar por extensión
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return false;
    }
    
    // Verificar por MIME type
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(mimeType)) {
      return false;
    }
    
    return true;
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validar tipo de archivo
    if (!validateFileType(file)) {
      const errorMsg = `Tipo de archivo no permitido. Solo se permiten: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)`;
      setError(errorMsg);
      onFileTypeError?.(errorMsg);
      return;
    }

    const form = new FormData();
    form.append('file', file);
    if (expedienteId) form.append('expedienteId', String(expedienteId));
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/documents/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.url) {
        setUploadedFile(file.name);
        onUpload?.(data.url);
      } else {
        setError(data.error || 'Error al subir el archivo');
      }
    } catch (e) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [expedienteId, onUpload, onFileTypeError]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragOver 
          ? 'border-[#0093DF] bg-blue-50' 
          : uploadedFile 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 hover:border-[#0093DF] hover:bg-gray-50'
        }
        ${loading ? 'pointer-events-none opacity-50' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => handleFiles(e.target.files)}
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        className="hidden"
      />
      
      {uploadedFile ? (
        <div className="space-y-2">
          <File className="mx-auto h-12 w-12 text-green-500" />
          <p className="text-sm font-medium text-green-700">Archivo subido</p>
          <p className="text-xs text-green-600">{uploadedFile}</p>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0093DF] mx-auto"></div>
          <p className="text-sm text-gray-600">Subiendo archivo...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Arrastre o haga click para seleccionar
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Solo PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-3 flex items-center justify-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
