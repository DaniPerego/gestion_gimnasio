'use client';

import { useState } from 'react';

type SuscripcionWithRelations = {
  id: string;
  socio: { nombre: string; apellido: string; dni: string };
  plan: { nombre: string; precio: number };
};

export default function SuscripcionSearchSelect({
  suscripciones,
  defaultValue = '',
}: {
  suscripciones: SuscripcionWithRelations[];
  defaultValue?: string;
}) {
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(defaultValue);

  const filteredSuscripciones = suscripciones.filter((s) => {
    const searchLower = searchValue.toLowerCase();
    return (
      s.socio.nombre.toLowerCase().includes(searchLower) ||
      s.socio.apellido.toLowerCase().includes(searchLower) ||
      s.socio.dni.includes(searchLower) ||
      s.plan.nombre.toLowerCase().includes(searchLower)
    );
  });

  const selectedSuscripcion = suscripciones.find((s) => s.id === selectedId);
  const displayText = selectedSuscripcion
    ? `${selectedSuscripcion.socio.nombre} ${selectedSuscripcion.socio.apellido} - ${selectedSuscripcion.plan.nombre}`
    : 'Seleccione una suscripción';

  return (
    <div className="relative">
      <input type="hidden" name="suscripcionId" value={selectedId} />
      <div
        className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 pr-3 text-sm outline-2 placeholder:text-gray-500 cursor-pointer flex items-center justify-between hover:border-gray-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-900">{displayText}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <input
            type="text"
            placeholder="Buscar socio, plan..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full px-3 py-2 border-b border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-blue-500 text-sm rounded-t-md"
            autoFocus
          />
          <div className="max-h-60 overflow-y-auto">
            {filteredSuscripciones.length > 0 ? (
              filteredSuscripciones.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedId(s.id);
                    setIsOpen(false);
                    setSearchValue('');
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {s.socio.nombre} {s.socio.apellido}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.plan.nombre} - ${Number(s.plan.precio).toFixed(2)}
                    </div>
                  </div>
                  {selectedId === s.id && (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No se encontraron suscripciones</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
