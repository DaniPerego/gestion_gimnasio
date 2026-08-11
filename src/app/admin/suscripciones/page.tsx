import Link from 'next/link';
import SuscripcionesTable from '@/components/suscripciones/table';
import Pagination from '@/components/pagination';
import { Suspense } from 'react';
import { fetchSuscripcionesPages } from '@/lib/data-suscripciones';
import SearchInput from '@/components/ui/search-input';
import StatusFilter from '@/components/ui/status-filter';

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
  const totalPages = await fetchSuscripcionesPages(query, filtro);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Suscripciones</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="relative flex flex-1 shrink-0">
          <label htmlFor="search" className="sr-only">Buscar</label>
          <SearchInput placeholder="Buscar por socio..." />
        </div>
        <StatusFilter
          filterKey="filtro"
          options={[
            { value: 'vencidas', label: 'Vencidas' },
            { value: 'por-vencer', label: 'Por vencer (7 días)' },
          ]}
          placeholder="Todas"
        />
        <Link
          href="/admin/suscripciones/create"
          className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Nueva Suscripción</span>
          <span className="md:hidden">+</span>
        </Link>
      </div>
      <Suspense key={query + currentPage + filtro} fallback={<div>Cargando...</div>}>
        <SuscripcionesTable query={query} currentPage={currentPage} filtro={filtro} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
