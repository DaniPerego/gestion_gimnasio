import Link from 'next/link';
import SociosTable from '@/components/socios/table';
import Search from '@/components/ui/search';
import StatusFilter from '@/components/ui/status-filter';
import Pagination from '@/components/pagination';
import { Suspense } from 'react';
import { fetchSociosPages } from '@/lib/data-socios';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    estado?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const currentPage = Number(params?.page) || 1;
  const estado = params?.estado || '';
  const totalPages = await fetchSociosPages(query, estado);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Socios</h1>
      </div>
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-2 md:mt-8">
        <div className="flex flex-1 gap-2">
          <Search placeholder="Buscar socios por nombre, DNI o email..." />
          <StatusFilter 
            filterKey="estado" 
            options={[
              { value: 'activo', label: 'Activos' },
              { value: 'inactivo', label: 'Inactivos' },
            ]}
            placeholder="Todos"
          />
        </div>
        <Link
          href="/admin/socios/create"
          className="flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Crear Socio</span>
          <span className="md:hidden">+</span>
        </Link>
      </div>
      <Suspense key={query + currentPage + estado} fallback={<div className="mt-4 text-gray-500">Cargando...</div>}>
        <SociosTable query={query} currentPage={currentPage} estado={estado} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
