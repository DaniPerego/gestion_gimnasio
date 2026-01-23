import Link from 'next/link';
import UsuariosTable from '@/components/usuarios/table';
import Search from '@/components/ui/search';
import StatusFilter from '@/components/ui/status-filter';
import Pagination from '@/components/pagination';
import { fetchUsuariosPages } from '@/lib/data-usuarios';
import { Suspense } from 'react';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    rol?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const currentPage = Number(params?.page) || 1;
  const rol = params?.rol || '';
  const totalPages = await fetchUsuariosPages(query, rol);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Usuarios</h1>
      </div>
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-2 md:mt-8">
        <div className="flex flex-1 gap-2">
          <Search placeholder="Buscar usuarios por nombre o email..." />
          <StatusFilter 
            filterKey="rol" 
            options={[
              { value: 'ADMIN', label: 'Administrador' },
              { value: 'RECEPCIONISTA', label: 'Recepcionista' },
            ]}
            placeholder="Todos los roles"
          />
        </div>
        <Link
          href="/admin/usuarios/create"
          className="flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Crear Usuario</span>
          <span className="md:hidden">+</span>
        </Link>
      </div>
      <Suspense key={query + currentPage + rol} fallback={<div className="mt-4 text-gray-500">Cargando...</div>}>
        <UsuariosTable query={query} currentPage={currentPage} rol={rol} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
