import { fetchSociosConCuentaCorriente, fetchSociosCuentaCorrientePages } from '@/lib/data-cuenta-corriente';
import SearchInput from '@/components/ui/search-input';
import StatusFilter from '@/components/ui/status-filter';
import Pagination from '@/components/pagination';
import CuentaCorrienteTable from '@/components/cuenta-corriente/table';
import { Suspense } from 'react';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    filtro?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const currentPage = Number(params?.page) || 1;
  const filtro = params?.filtro || '';
  
  const socios = await fetchSociosConCuentaCorriente(query, currentPage, filtro);
  const totalPages = await fetchSociosCuentaCorrientePages(query, filtro);

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Cuenta Corriente</h1>
      </div>

      <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Gestiona deudas y créditos de manera ágil:</strong> Busca un socio, abre su cuenta corriente 
          y registra movimientos. Los pagos se aplican automáticamente desde las transacciones.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <label htmlFor="search" className="sr-only">Buscar</label>
            <SearchInput placeholder="Buscar socio por nombre, apellido o DNI..." />
          </div>
          <StatusFilter 
            filterKey="filtro" 
            options={[
              { value: 'con-cuenta', label: 'Con cuenta' },
              { value: 'sin-cuenta', label: 'Sin cuenta' },
              { value: 'con-deuda', label: 'Con deuda' },
              { value: 'con-credito', label: 'Con crédito' },
            ]}
            placeholder="Todos"
          />
        </div>
      </div>

      <Suspense key={query + currentPage + filtro} fallback={<div className="mt-4 text-gray-500">Cargando...</div>}>
        <CuentaCorrienteTable socios={socios} />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </main>
  );
}
