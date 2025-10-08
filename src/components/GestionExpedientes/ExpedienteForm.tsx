'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { SingleSelect, SelectOption } from '../SingleSelect';

const expedienteSchema = z.object({
  number: z.string().min(1, 'El número es requerido'),
  state: z.enum(['en_tramite', 'cerrado', 'pendiente']),
  responsibleUserId: z.number().refine((n) => !Number.isNaN(n), { message: 'Seleccione un responsable' }),
  areaId: z.number().refine((n) => !Number.isNaN(n), { message: 'Seleccione un área' }),
});

export type ExpedienteFormData = z.infer<typeof expedienteSchema>;

type ExpedienteFormProps = {
  defaultValues?: Partial<ExpedienteFormData>;
  onSubmit: (data: ExpedienteFormData) => void;
  areas: Array<{ id: number; name: string }>;
  users: Array<{ id: number; username: string }>;
  onClose: () => void;
  onCreateArea?: (name: string) => Promise<{ id: number; name: string }>;
  onCreateUser?: (username: string) => Promise<{ id: number; username: string }>;
};

export const ExpedienteForm = ({ 
  defaultValues, 
  onSubmit, 
  areas, 
  users, 
  onClose, 
  onCreateArea, 
  onCreateUser 
}: ExpedienteFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpedienteFormData>({
    resolver: zodResolver(expedienteSchema),
    defaultValues: {
      number: '',
      state: 'en_tramite',
      responsibleUserId: 0,
      areaId: 0,
      ...defaultValues,
    },
  });

  const [selectedResponsible, setSelectedResponsible] = useState<number | null>(
    defaultValues?.responsibleUserId || null
  );
  const [selectedArea, setSelectedArea] = useState<number | null>(
    defaultValues?.areaId || null
  );
  const [availableAreas, setAvailableAreas] = useState(areas);
  const [availableUsers, setAvailableUsers] = useState(users);

  useEffect(() => {
    setSelectedResponsible(defaultValues?.responsibleUserId || null);
    setSelectedArea(defaultValues?.areaId || null);
  }, [defaultValues]);

  // Convertir datos para el SingleSelect
  const responsibleOptions: SelectOption[] = availableUsers.map(user => ({
    id: user.id,
    label: user.username,
    value: user.id,
  }));

  const areaOptions: SelectOption[] = availableAreas.map(area => ({
    id: area.id,
    label: area.name,
    value: area.id,
  }));

  const handleResponsibleChange = (selectedId: string | number | null) => {
    const numericId = selectedId ? Number(selectedId) : 0;
    setSelectedResponsible(numericId);
    setValue('responsibleUserId', numericId);
  };

  const handleAreaChange = (selectedId: string | number | null) => {
    const numericId = selectedId ? Number(selectedId) : 0;
    setSelectedArea(numericId);
    setValue('areaId', numericId);
  };

  const handleCreateArea = async (areaName: string) => {
    if (onCreateArea) {
      try {
        const newArea = await onCreateArea(areaName);
        setAvailableAreas(prev => [...prev, newArea]);
        setSelectedArea(newArea.id);
        setValue('areaId', newArea.id);
      } catch (error) {
        console.error('Error creating area:', error);
      }
    }
  };

  const handleCreateUser = async (username: string) => {
    if (onCreateUser) {
      try {
        const newUser = await onCreateUser(username);
        setAvailableUsers(prev => [...prev, newUser]);
        setSelectedResponsible(newUser.id);
        setValue('responsibleUserId', newUser.id);
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
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
        <SingleSelect
          options={responsibleOptions}
          selectedValue={selectedResponsible}
          onChange={handleResponsibleChange}
          placeholder="Seleccionar responsable..."
          searchPlaceholder="Buscar responsable..."
          emptyMessage="No se encontraron responsables"
          createNewMessage="Crear nuevo responsable"
          allowCreate={!!onCreateUser}
          onCreateNew={handleCreateUser}
          className={errors.responsibleUserId ? 'border-red-500' : ''}
        />
        {errors.responsibleUserId && (
          <p className="text-red-500 text-sm mt-1">{errors.responsibleUserId.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="areaId" className="block text-sm font-medium text-gray-700">
          Área
        </label>
        <SingleSelect
          options={areaOptions}
          selectedValue={selectedArea}
          onChange={handleAreaChange}
          placeholder="Seleccionar área..."
          searchPlaceholder="Buscar área..."
          emptyMessage="No se encontraron áreas"
          createNewMessage="Crear nueva área"
          allowCreate={!!onCreateArea}
          onCreateNew={handleCreateArea}
          className={errors.areaId ? 'border-red-500' : ''}
        />
        {errors.areaId && (
          <p className="text-red-500 text-sm mt-1">{errors.areaId.message}</p>
        )}
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