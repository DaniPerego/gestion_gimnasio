import Link from 'next/link';
import AsistenciasTable from '@/components/asistencias/table';
import Pagination from '@/components/pagination';
import { Suspense } from 'react';
import { fetchAsistenciasPages } from '@/lib/data-asistencias';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const currentPage = Number(params?.page) || 1;
  const totalPages = await fetchAsistenciasPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Historial de Asistencias</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="relative flex flex-1 shrink-0">
            <label htmlFor="search" className="sr-only">
            Buscar
            </label>
            <input
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
            placeholder="Buscar por socio..."
            defaultValue={query}
            />
        </div>
        <Link
          href="/admin/asistencias/check-in"
          className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Check-in Manual</span>
          <span className="md:hidden">+</span>
        </Link>
      </div>
      <Suspense fallback={<div>Cargando...</div>}>
        <AsistenciasTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
