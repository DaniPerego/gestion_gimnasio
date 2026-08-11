'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function FiltroModalidad({
  modalidades,
}: {
  modalidades: { id: string; nombre: string }[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilter = (modalidadId: string) => {
    const params = new URLSearchParams(searchParams);
    if (modalidadId) {
      params.set('modalidad', modalidadId);
    } else {
      params.delete('modalidad');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select onChange={(e) => handleFilter(e.target.value)} defaultValue={searchParams.get('modalidad') || ''} className="peer block w-1/3 rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500">
      <option value="">Todas las modalidades</option>
      {modalidades.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
    </select>
  );
}