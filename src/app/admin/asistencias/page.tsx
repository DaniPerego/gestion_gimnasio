import Link from 'next/link';
import AsistenciasTable from '@/components/asistencias/table';
import Pagination from '@/components/pagination';
import DisciplineFilter from '@/components/asistencias/discipline-filter';
import DateFilter from '@/components/asistencias/date-filter';
import SearchInput from '@/components/ui/search-input';
import { Suspense } from 'react';
import { fetchAsistenciasPages } from '@/lib/data-asistencias';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    discipline?: string;
    date?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const discipline = params?.discipline || '';
  const date = params?.date || '';
  const currentPage = Number(params?.page) || 1;
  const totalPages = await fetchAsistenciasPages(query, discipline, date);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Historial de Asistencias</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="relative flex flex-1 shrink-0">
          <label htmlFor="search" className="sr-only">Buscar</label>
          <SearchInput placeholder="Buscar por socio..." />
        </div>
        <Link
          href="/admin/asistencias/check-in"
          className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Check-in Manual</span>
          <span className="md:hidden">+</span>
        </Link>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <DateFilter />
        <DisciplineFilter />
      </div>
      <Suspense fallback={<div>Cargando...</div>}>
        <AsistenciasTable query={query} currentPage={currentPage} discipline={discipline} date={date} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
