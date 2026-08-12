'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TransaccionesDB } from '@/lib/db';
import DeleteButton from './delete-button';

export default function TransaccionesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [transacciones, setTransacciones] = useState<any[]>([]);

  useEffect(() => {
    const ITEMS_PER_PAGE = 10;
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const all = TransaccionesDB.findMany({
      where: {},
      include: {
        suscripcion: {
          include: {
            socio: true,
            plan: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    const filtered = query
      ? all.filter((t: any) => {
          const socio = t.suscripcion?.socio;
          if (!socio) return false;
          const q = query.toLowerCase();
          return (
            socio.nombre?.toLowerCase().includes(q) ||
            socio.apellido?.toLowerCase().includes(q) ||
            socio.dni?.includes(q)
          );
        })
      : all;

    const paginated = filtered.slice(offset, offset + ITEMS_PER_PAGE);

    setTransacciones(
      paginated.map((t: any) => ({
        ...t,
        fecha: new Date(t.fecha),
        monto: Number(t.monto),
        suscripcion: t.suscripcion
          ? {
              ...t.suscripcion,
              fechaFin: new Date(t.suscripcion.fechaFin),
              fechaInicio: new Date(t.suscripcion.fechaInicio),
              plan: {
                ...t.suscripcion.plan,
                precio: Number(t.suscripcion.plan?.precio || 0),
              },
            }
          : undefined,
      }))
    );
  }, [query, currentPage]);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2 md:pt-0">
          <div className="md:hidden">
            {transacciones.map((transaccion) => (
              <div
                key={transaccion.id}
                className="mb-3 w-full rounded-md bg-white dark:bg-gray-700 p-4"
              >
                <div className="flex items-start justify-between pb-3 border-b dark:border-gray-600">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {transaccion.suscripcion?.socio?.nombre} {transaccion.suscripcion?.socio?.apellido}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2" title={transaccion.notas || transaccion.suscripcion?.plan?.nombre}>
                      {transaccion.notas || transaccion.suscripcion?.plan?.nombre}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      ${Number(transaccion.monto).toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {transaccion.fecha.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </p>
                    <span className={`px-2 py-1 text-xs rounded-full uppercase font-medium ${transaccion.tipoPago === 'CUOTA_SUSCRIPCION' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'}`}>
                      {transaccion.tipoPago === 'CUOTA_SUSCRIPCION' ? 'Cuota' : 'Otro'}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 uppercase font-medium">
                      {transaccion.metodoPago}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 dark:text-gray-100 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6 text-gray-900 dark:text-gray-100">
                  Socio
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Concepto
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Monto
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Tipo
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Método
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700">
              {transacciones.map((transaccion) => (
                <tr
                  key={transaccion.id}
                  className="w-full border-b border-gray-200 dark:border-gray-600 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{transaccion.suscripcion?.socio?.nombre} {transaccion.suscripcion?.socio?.apellido}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 max-w-xs">
                    <p className="truncate" title={transaccion.notas || transaccion.suscripcion?.plan?.nombre}>
                      {transaccion.notas || transaccion.suscripcion?.plan?.nombre}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium">
                    ${Number(transaccion.monto).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {transaccion.fecha.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' })} {transaccion.fecha.toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full uppercase font-medium ${transaccion.tipoPago === 'CUOTA_SUSCRIPCION' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
                      {transaccion.tipoPago === 'CUOTA_SUSCRIPCION' ? 'Cuota' : 'Otro'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {transaccion.metodoPago}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/transacciones/${transaccion.id}`}
                        className="rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={transaccion.id} />
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
