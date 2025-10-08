'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Dropzone from '@/components/Dropzone';
import { SingleSelect, SelectOption } from '../SingleSelect';
import { getCurrentPeruDateTimeInput, getCurrentPeruDateInput } from '@/lib/dateUtils';

type Option = { id: number; name?: string; username?: string; number?: string; areaName?: string };

const documentSchema = z.object({
  expedienteId: z.number().refine((n) => !Number.isNaN(n) && n > 0, { message: 'Seleccione un expediente' }),
  name: z.string().min(1, 'El nombre del documento es requerido'),
  date: z.string().min(1, 'La fecha y hora es requerida'),
  filePath: z.string().min(1, 'Debe subir un archivo'),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

type Props = {
  onSubmit: (data: DocumentFormData) => Promise<void> | void;
  onClose?: () => void;
  expedientes: Option[];
  defaultValues?: Partial<DocumentFormData>;
  isEditing?: boolean;
};

export const DocumentForm = ({ onSubmit, onClose, expedientes, defaultValues, isEditing = false }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      expedienteId: defaultValues?.expedienteId ?? 0,
      name: defaultValues?.name ?? '',
      date: defaultValues?.date ?? getCurrentPeruDateTimeInput(),
      filePath: defaultValues?.filePath ?? '',
    },
  });

  const [selectedExpediente, setSelectedExpediente] = useState<number | null>(
    defaultValues?.expedienteId || null
  );
  const [fileUploaded, setFileUploaded] = useState(false);

  // Verificar si el formulario es válido para deshabilitar el botón
  const isFormValid = selectedExpediente && selectedExpediente > 0 && 
                     watch('name')?.trim() && 
                     watch('date') && 
                     (isEditing || fileUploaded);

  // Obtener el expediente seleccionado para mostrar su área
  const selectedExpedienteData = expedientes.find(exp => exp.id === selectedExpediente);

  // Convertir expedientes para el SingleSelect
  const expedienteOptions: SelectOption[] = expedientes.map(exp => ({
    id: exp.id,
    label: exp.number || `EXP-${exp.id}`,
    value: exp.id,
  }));

  const handleExpedienteChange = (selectedId: string | number | null) => {
    const numericId = selectedId ? Number(selectedId) : 0;
    setSelectedExpediente(numericId);
    setValue('expedienteId', numericId);
  };

  const handleFileUpload = (url: string) => {
    setValue('filePath', url);
    setFileUploaded(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expediente *
          </label>
          <SingleSelect
            options={expedienteOptions}
            selectedValue={selectedExpediente}
            onChange={handleExpedienteChange}
            placeholder="Seleccionar expediente..."
            searchPlaceholder="Buscar expediente..."
            emptyMessage="No se encontraron expedientes"
            className={errors.expedienteId ? 'border-red-500' : ''}
          />
          {errors.expedienteId && (
            <p className="text-red-500 text-sm mt-1">{errors.expedienteId.message}</p>
          )}
          {selectedExpedienteData && selectedExpedienteData.areaName && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                <span className="font-medium">Área del expediente:</span> {selectedExpedienteData.areaName}
              </div>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del documento *
          </label>
          <input
            {...register('name')}
            type="text"
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0093DF] focus:border-[#0093DF] ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ej. Contrato de servicios"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha y Hora *
          </label>
          <input
            {...register('date')}
            type="datetime-local"
            disabled
            className={`w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Se establecerá automáticamente la fecha
          </p>
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>
      </div>

      {!isEditing && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Archivo *
          </label>
          <Dropzone
            onUpload={handleFileUpload}
            onFileTypeError={(error) => console.error('Tipo de archivo no válido:', error)}
          />
          {fileUploaded && (
            <p className="text-sm text-green-600 mt-2 font-medium">✓ Archivo subido</p>
          )}
          {errors.filePath && (
            <p className="text-red-500 text-sm mt-1">{errors.filePath.message}</p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        {onClose && (
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          disabled={!isFormValid}
          className={`px-4 py-2 rounded-md text-white ${
            isFormValid 
              ? 'bg-[#0093DF] hover:bg-blue-700 cursor-pointer' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default DocumentForm;


