'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type SocioOption = {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
};

export default function SocioHistorialSearchSelect({ socios }: { socios: SocioOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('socioId') || '';
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selectedSocio = useMemo(
    () => socios.find((socio) => socio.id === selectedId) || null,
    [selectedId, socios]
  );

  useEffect(() => {
    if (selectedSocio) {
      setQuery(`${selectedSocio.apellido}, ${selectedSocio.nombre} - ${selectedSocio.dni}`);
    } else {
      setQuery('');
    }
  }, [selectedSocio]);

  const filteredSocios = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return socios.slice(0, 12);
    }

    return socios.filter((socio) => {
      const fullName = `${socio.apellido}, ${socio.nombre}`.toLowerCase();
      return (
        fullName.includes(normalizedQuery) ||
        socio.nombre.toLowerCase().includes(normalizedQuery) ||
        socio.apellido.toLowerCase().includes(normalizedQuery) ||
        socio.dni.includes(normalizedQuery)
      );
    }).slice(0, 12);
  }, [query, socios]);

  const updateUrl = (socioId: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));

    if (socioId) {
      params.set('socioId', socioId);
    } else {
      params.delete('socioId');
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative w-full md:min-w-80">
      <label htmlFor="socio-search" className="mb-1 block text-sm font-medium text-gray-700">
        Socio
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="socio-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
            autoComplete="off"
          />

          {open && (
            <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="max-h-64 overflow-y-auto py-1">
                {filteredSocios.length > 0 ? (
                  filteredSocios.map((socio) => (
                    <button
                      key={socio.id}
                      type="button"
                      onClick={() => {
                        setQuery(`${socio.apellido}, ${socio.nombre} - ${socio.dni}`);
                        setOpen(false);
                        updateUrl(socio.id);
                      }}
                      className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-gray-100"
                    >
                      <span className="font-medium text-gray-900">
                        {socio.apellido}, {socio.nombre}
                      </span>
                      <span className="text-xs text-gray-500">DNI: {socio.dni}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">No se encontraron socios</div>
                )}
              </div>
            </div>
          )}
        </div>

        {selectedId && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(false);
              updateUrl('');
            }}
            className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}