'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SociosDB } from '@/lib/db';
import WhatsAppButton from './whatsapp-button';

export default function SociosTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const router = useRouter();
  const [socios, setSocios] = useState<any[]>([]);

  useEffect(() => {
    const ITEMS_PER_PAGE = 10;
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const all = SociosDB.findMany({
      where: {
        OR: [
          { nombre: query },
          { apellido: query },
          { dni: query },
          { email: query },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    setSocios(all.slice(offset, offset + ITEMS_PER_PAGE));
  }, [query, currentPage]);

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este socio?')) {
      SociosDB.delete({ id });
      router.refresh();
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2 md:pt-0">
          <div className="md:hidden">
            {socios.map((socio) => (
              <div
                key={socio.id}
                className="mb-2 w-full rounded-md bg-white dark:bg-gray-700 p-4"
              >
                <div className="flex items-center justify-between border-b dark:border-gray-600 pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p className="text-gray-900 dark:text-gray-100">{socio.nombre} {socio.apellido}</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{socio.email}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${socio.activo ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                    {socio.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium text-gray-900 dark:text-gray-100">{socio.dni}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/cuenta-corriente/${socio.id}`}
                      title="Ver cuotas/deuda"
                      className="rounded-md border border-blue-300 dark:border-blue-600 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    >
                      💳
                    </Link>
                    <WhatsAppButton telefono={socio.telefono} nombre={socio.nombre} />
                    <Link href={`/admin/socios/${socio.id}/edit`} className="rounded-md border border-gray-300 dark:border-gray-600 p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(socio.id)}
                      className="rounded-md border border-gray-300 dark:border-gray-600 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 dark:text-gray-100 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6 text-gray-900 dark:text-gray-100">Nombre</th>
                <th scope="col" className="px-3 py-5 font-medium text-gray-900 dark:text-gray-100">DNI</th>
                <th scope="col" className="px-3 py-5 font-medium text-gray-900 dark:text-gray-100">Email</th>
                <th scope="col" className="px-3 py-5 font-medium text-gray-900 dark:text-gray-100">Estado</th>
                <th scope="col" className="relative py-3 pl-6 pr-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700">
              {socios.map((socio) => (
                <tr
                  key={socio.id}
                  className="w-full border-b border-gray-200 dark:border-gray-600 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{socio.nombre} {socio.apellido}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{socio.dni}</td>
                  <td className="whitespace-nowrap px-3 py-3">{socio.email}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${socio.activo ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                      {socio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/cuenta-corriente/${socio.id}`}
                        title="Ver cuotas/deuda"
                        className="rounded-md border border-blue-300 dark:border-blue-600 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      >
                        💳
                      </Link>
                      <WhatsAppButton telefono={socio.telefono} nombre={socio.nombre} />
                      <Link href={`/admin/socios/${socio.id}/edit`} className="rounded-md border border-gray-300 dark:border-gray-600 p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                        ✏️
                      </Link>
                      <button
                        onClick={() => handleDelete(socio.id)}
                        className="rounded-md border border-gray-300 dark:border-gray-600 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
