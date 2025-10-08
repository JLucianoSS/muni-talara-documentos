'use client';

import { useState } from 'react';
import { MultiSelect, SelectOption } from './MultiSelect';

// Datos de ejemplo
const sampleUsers: SelectOption[] = [
  { id: 1, label: 'Juan Pérez', value: 1 },
  { id: 2, label: 'María García', value: 2 },
  { id: 3, label: 'Carlos López', value: 3 },
  { id: 4, label: 'Ana Martínez', value: 4 },
  { id: 5, label: 'Luis Rodríguez', value: 5 },
];

const sampleAreas: SelectOption[] = [
  { id: 1, label: 'Gerencia General', value: 1 },
  { id: 2, label: 'Recursos Humanos', value: 2 },
  { id: 3, label: 'Contabilidad', value: 3 },
  { id: 4, label: 'Obras Públicas', value: 4 },
  { id: 5, label: 'Desarrollo Social', value: 5 },
];

export const MultiSelectDemo = () => {
  const [selectedUsers, setSelectedUsers] = useState<(string | number)[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<(string | number)[]>([]);

  const handleCreateUser = async (username: string) => {
    // Simular creación de usuario
    console.log('Creando usuario:', username);
    // En una implementación real, aquí harías la llamada a la API
    return { id: Date.now(), username };
  };

  const handleCreateArea = async (areaName: string) => {
    // Simular creación de área
    console.log('Creando área:', areaName);
    // En una implementación real, aquí harías la llamada a la API
    return { id: Date.now(), name: areaName };
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Demo del Componente MultiSelect
        </h2>
        <p className="text-gray-600">
          Componente de selección múltiple con búsqueda y creación de nuevas opciones
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Responsables
          </label>
          <MultiSelect
            options={sampleUsers}
            selectedValues={selectedUsers}
            onChange={setSelectedUsers}
            placeholder="Seleccionar responsables..."
            searchPlaceholder="Buscar responsables..."
            emptyMessage="No se encontraron responsables"
            createNewMessage="Crear nuevo responsable"
            allowCreate={true}
            onCreateNew={handleCreateUser}
          />
          <p className="text-sm text-gray-500 mt-1">
            Seleccionados: {selectedUsers.length} responsable(s)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Áreas
          </label>
          <MultiSelect
            options={sampleAreas}
            selectedValues={selectedAreas}
            onChange={setSelectedAreas}
            placeholder="Seleccionar áreas..."
            searchPlaceholder="Buscar áreas..."
            emptyMessage="No se encontraron áreas"
            createNewMessage="Crear nueva área"
            allowCreate={true}
            onCreateNew={handleCreateArea}
          />
          <p className="text-sm text-gray-500 mt-1">
            Seleccionadas: {selectedAreas.length} área(s)
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">Características del componente:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Búsqueda en tiempo real</li>
          <li>• Selección múltiple con chips removibles</li>
          <li>• Navegación con teclado (flechas, Enter, Escape)</li>
          <li>• Creación de nuevas opciones</li>
          <li>• Interfaz responsive y accesible</li>
          <li>• Personalizable con props</li>
        </ul>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Valores seleccionados:</h3>
        <div className="text-sm">
          <p><strong>Responsables:</strong> {selectedUsers.join(', ') || 'Ninguno'}</p>
          <p><strong>Áreas:</strong> {selectedAreas.join(', ') || 'Ninguna'}</p>
        </div>
      </div>
    </div>
  );
};
