import Link from 'next/link';
import ProductosTable from '@/components/productos/table';
import { Suspense } from 'react';
import Search from '@/components/search'; // Assuming a reusable search component exists or I'll create a local one

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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inventario de Productos</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <div className="relative flex flex-1 shrink-0">
            {/* Reusing the search input style from socios page for now, ideally should be a component */}
             <form className="relative flex flex-1 shrink-0">
                <label htmlFor="search" className="sr-only">
                Buscar
                </label>
                <input
                name="query"
                className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                placeholder="Buscar productos..."
                defaultValue={query}
                />
                {/* Simple submit on enter */}
            </form>
        </div>
        <Link
          href="/admin/productos/create"
          className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Nuevo Producto</span>
          <span className="md:hidden">+</span>
        </Link>
      </div>
      <Suspense fallback={<div>Cargando productos...</div>}>
        <ProductosTable query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}
