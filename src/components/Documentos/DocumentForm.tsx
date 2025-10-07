'use client';

import { useState } from 'react';
import Dropzone from '@/components/Dropzone';

type Option = { id: number; name?: string; username?: string; number?: string };

export type DocumentFormData = {
  expedienteId: number;
  name: string;
  type: 'PDF' | 'Word' | 'Excel' | 'Otro';
  date: string;
  filePath: string;
};

type Props = {
  onSubmit: (data: DocumentFormData) => Promise<void> | void;
  onClose?: () => void;
  expedientes: Option[];
  defaultValues?: Partial<DocumentFormData>;
};

export const DocumentForm = ({ onSubmit, onClose, expedientes, defaultValues }: Props) => {
  const [form, setForm] = useState<DocumentFormData>({
    expedienteId: defaultValues?.expedienteId ?? (expedientes[0]?.id ?? 0),
    name: defaultValues?.name ?? '',
    type: (defaultValues?.type as any) ?? 'PDF',
    date: defaultValues?.date ?? new Date().toISOString().slice(0, 10),
    filePath: defaultValues?.filePath ?? '',
  });

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit(form);
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Expediente</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={form.expedienteId}
            onChange={(e) => setForm((f) => ({ ...f, expedienteId: Number(e.target.value) }))}
          >
            {expedientes.map((x) => (
              <option key={x.id} value={x.id}>{x.number}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nombre del documento</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2"
            placeholder="Ej. Contrato de servicios"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Tipo de documento</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
          >
            <option value="PDF">PDF</option>
            <option value="Word">Word</option>
            <option value="Excel">Excel</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Fecha</label>
          <input
            type="date"
            className="w-full border rounded-md px-3 py-2"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-2">Archivo</label>
        <Dropzone
          onUpload={(url) => setForm((f) => ({ ...f, filePath: url }))}
        />
        {form.filePath && (
          <p className="text-sm text-gray-600 mt-1">Archivo subido: {form.filePath}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {onClose && (
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border">
            Cancelar
          </button>
        )}
        <button type="submit" className="px-4 py-2 rounded-md bg-[#0093DF] text-white">
          Guardar
        </button>
      </div>
    </form>
  );
};

export default DocumentForm;


