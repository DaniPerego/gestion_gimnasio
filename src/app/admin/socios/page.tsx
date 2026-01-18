import Link from 'next/link';
import SociosTable from '@/components/socios/table';
import Search from '@/components/search';
import Pagination from '@/components/pagination';
import { fetchSociosPages } from '@/lib/data-socios';
import { Suspense } from 'react';

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

  const totalPages = await fetchSociosPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Socios</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar socios..." />
        <Link
          href="/admin/socios/create"
          className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Crear Socio</span>
          <span className="md:hidden">+</span>
        </Link>
      </div>
      <Suspense fallback={<div>Cargando...</div>}>
         {/* @ts-expect-error Async Server Component */}
        <SociosTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
