'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';

const expedienteSchema = z.object({
  number: z.string().min(1, 'El número es requerido'),
  state: z.enum(['en_tramite', 'cerrado', 'pendiente']),
  responsibleUserId: z.number().refine((n) => !Number.isNaN(n), { message: 'Seleccione un responsable' }),
  areaName: z.string().min(1, 'El área es requerida'),
});

export type ExpedienteFormData = z.infer<typeof expedienteSchema>;

type ExpedienteFormProps = {
  defaultValues?: Partial<ExpedienteFormData>;
  onSubmit: (data: ExpedienteFormData) => void;
  areas: Array<{ id: number; name: string }>;
  users: Array<{ id: number; username: string }>;
  onClose: () => void;
};

export const ExpedienteForm = ({ defaultValues, onSubmit, areas, users, onClose }: ExpedienteFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpedienteFormData>({
    resolver: zodResolver(expedienteSchema),
    defaultValues: {
      number: '',
      state: 'en_tramite',
      areaName: '',
      ...defaultValues,
    },
  });

  const [areaQuery, setAreaQuery] = useState(defaultValues?.areaName || '');
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);

  useEffect(() => {
    setAreaQuery(defaultValues?.areaName || '');
  }, [defaultValues]);

  const filteredAreas = areas.filter((area) =>
    area.name.toLowerCase().includes(areaQuery.toLowerCase())
  );

  const handleAreaSelect = (areaName: string) => {
    setAreaQuery(areaName);
    setShowAreaSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="number" className="block text-sm font-medium text-gray-700">
          Número de Expediente
        </label>
        <input
          id="number"
          {...register('number')}
          className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0093DF] focus:border-[#0093DF] ${errors.number ? 'border-red-500' : ''}`}
          placeholder="EXP-001"
        />
        {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number.message}</p>}
      </div>
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
          Estado
        </label>
        <select
          id="state"
          {...register('state')}
          className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0093DF] focus:border-[#0093DF] ${errors.state ? 'border-red-500' : ''}`}
        >
          <option value="en_tramite">En Trámite</option>
          <option value="cerrado">Cerrado</option>
          <option value="pendiente">Pendiente</option>
        </select>
        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
      </div>
      <div>
        <label htmlFor="responsibleUserId" className="block text-sm font-medium text-gray-700">
          Responsable
        </label>
        <select
          id="responsibleUserId"
          {...register('responsibleUserId', { valueAsNumber: true })}
          className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0093DF] focus:border-[#0093DF] ${errors.responsibleUserId ? 'border-red-500' : ''}`}
        >
          <option value="">Seleccione responsable</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        {errors.responsibleUserId && (
          <p className="text-red-500 text-sm mt-1">{errors.responsibleUserId.message}</p>
        )}
      </div>
      <div className="relative">
        <label htmlFor="areaName" className="block text-sm font-medium text-gray-700">
          Área
        </label>
        <input
          id="areaName"
          {...register('areaName')}
          value={areaQuery}
          onChange={(e) => {
            setAreaQuery(e.target.value);
            setShowAreaSuggestions(true);
          }}
          onFocus={() => setShowAreaSuggestions(true)}
          className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0093DF] focus:border-[#0093DF] ${errors.areaName ? 'border-red-500' : ''}`}
          placeholder="Buscar o ingresar área"
        />
        {showAreaSuggestions && (
          <ul className="absolute z-10 w-full bg-[#FFFFFF] border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
            {filteredAreas.length > 0 ? (
              filteredAreas.map((area) => (
                <li
                  key={area.id}
                  onClick={() => handleAreaSelect(area.name)}
                  className="px-3 py-2 hover:bg-[#0093DF] hover:text-[#FFFFFF] cursor-pointer"
                >
                  {area.name}
                </li>
              ))
            ) : (
              areaQuery && (
                <li
                  onClick={() => handleAreaSelect(areaQuery)}
                  className="px-3 py-2 hover:bg-[#0093DF] hover:text-[#FFFFFF] cursor-pointer"
                >
                  Crear nueva área: "{areaQuery}"
                </li>
              )
            )}
          </ul>
        )}
        {errors.areaName && <p className="text-red-500 text-sm mt-1">{errors.areaName.message}</p>}
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#0093DF] text-[#FFFFFF] rounded-md hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};