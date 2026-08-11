import Link from 'next/link';
import SociosTable from '@/components/socios/table';
import { Suspense } from 'react';
import SearchInput from '@/components/ui/search-input';

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

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Socios</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="relative flex flex-1 shrink-0">
          <label htmlFor="search" className="sr-only">Buscar</label>
          <SearchInput placeholder="Buscar socios..." />
        </div>
        <Link
          href="/admin/socios/create"
          className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Crear Socio</span>
          <span className="md:hidden">+</span>
        </Link>
      </div>
      <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950 p-3">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          Para ver cuotas pagadas y deuda por socio, usá el botón <strong>💳</strong> en Acciones.
        </p>
      </div>
      <Suspense fallback={<div>Cargando...</div>}>
        <SociosTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        {/* Pagination Component Placeholder */}
      </div>
    </div>
  );
}
