'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';

export interface SelectOption {
  id: string | number;
  label: string;
  value: string | number;
}

interface SingleSelectProps {
  options: SelectOption[];
  selectedValue: string | number | null;
  onChange: (selectedValue: string | number | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  createNewMessage?: string;
  allowCreate?: boolean;
  onCreateNew?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  maxHeight?: string;
}

export const SingleSelect = ({
  options,
  selectedValue,
  onChange,
  placeholder = "Seleccionar opción...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron opciones",
  createNewMessage = "Crear nueva opción",
  allowCreate = false,
  onCreateNew,
  className = "",
  disabled = false,
  maxHeight = "200px"
}: SingleSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar opciones basado en la búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Obtener opción seleccionada para mostrar
  const selectedOption = options.find(option => option.value === selectedValue);

  // Manejar click fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enfocar el input de búsqueda cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Manejar teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[focusedIndex]);
        } else if (allowCreate && searchQuery.trim() && onCreateNew) {
          onCreateNew(searchQuery.trim());
          setSearchQuery('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
        break;
    }
  };

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery('');
    setFocusedIndex(-1);
  };

  const handleRemove = () => {
    onChange(null);
  };

  const handleCreateNew = () => {
    if (allowCreate && searchQuery.trim() && onCreateNew) {
      onCreateNew(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Campo principal */}
      <div
        className={`
          min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-[#0093DF] focus:border-[#0093DF]
          cursor-pointer flex items-center justify-between
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#0093DF] text-white text-sm rounded-md">
              {selectedOption.label}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="hover:bg-blue-600 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
          style={{ 
            maxHeight,
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          {/* Barra de búsqueda */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0093DF] focus:border-[#0093DF]"
              />
            </div>
          </div>

          {/* Lista de opciones */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`
                    px-3 py-2 cursor-pointer hover:bg-[#0093DF] hover:text-white
                    ${focusedIndex === index ? 'bg-[#0093DF] text-white' : ''}
                    ${selectedValue === option.value ? 'bg-blue-100 text-blue-800' : ''}
                  `}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  {option.label}
                </div>
              ))
            ) : searchQuery.trim() && allowCreate && onCreateNew ? (
              <div
                className="px-3 py-2 cursor-pointer hover:bg-[#0093DF] hover:text-white text-gray-600"
                onClick={handleCreateNew}
              >
                {createNewMessage}: &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="px-3 py-2 text-gray-500 text-center">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
