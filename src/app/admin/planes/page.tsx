import Link from 'next/link';
import PlanesTable from '@/components/planes/table';
import { Suspense } from 'react';

export default async function Page() {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Planes de Membresía</h1>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 md:mt-8">
        <Link
          href="/admin/planes/create"
          className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Crear Plan</span>
          <span className="md:hidden">+</span>
        </Link>
      </div>
      <Suspense fallback={<div>Cargando planes...</div>}>
        <PlanesTable />
      </Suspense>
    </div>
  );
}
