'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuscripcionesDB } from '@/lib/db';
import { formatFechaBuenosAires } from '@/lib/date-utils';

export default function SuscripcionesTable({
  query,
  currentPage,
  filtro,
}: {
  query: string;
  currentPage: number;
  filtro?: string;
}) {
  const router = useRouter();
  const [suscripciones, setSuscripciones] = useState<any[]>([]);
  const now = new Date();

  useEffect(() => {
    const ITEMS_PER_PAGE = 10;
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const all = SuscripcionesDB.findMany({
      where: {},
      include: { socio: true, plan: true },
      orderBy: { createdAt: 'desc' },
    });

    // Apply filters
    let filtered = all;
    if (filtro === 'vencidas' || filtro === 'vencidas-mas') {
      filtered = all.filter((s: any) => new Date(s.fechaFin) < now);
    } else if (filtro === 'por-vencer') {
      const next7Days = new Date(now);
      next7Days.setDate(next7Days.getDate() + 7);
      filtered = all.filter((s: any) => {
        const ff = new Date(s.fechaFin);
        return ff >= now && ff <= next7Days;
      });
    }

    const paginated = filtered.slice(offset, offset + ITEMS_PER_PAGE);

    setSuscripciones(
      paginated.map((s: any) => ({
        ...s,
        fechaFin: new Date(s.fechaFin),
        fechaInicio: new Date(s.fechaInicio),
        plan: {
          ...s.plan,
          precio: Number(s.plan?.precio || 0),
        },
      }))
    );
  }, [query, currentPage, filtro]);

  const handleCancel = (id: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar esta suscripción?')) {
      SuscripcionesDB.update({ id }, { activa: false });
      router.refresh();
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2 md:pt-0">
          <div className="md:hidden">
            {suscripciones.map((suscripcion) => {
              const isExpired = suscripcion.fechaFin < now;
              const isActive = suscripcion.activa && !isExpired;
              const statusLabel = isActive ? 'Activa' : isExpired ? 'Vencida' : 'Inactiva';
              const statusClasses = isActive
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';

              return (
                <div
                  key={suscripcion.id}
                  className="mb-2 w-full rounded-md bg-white dark:bg-gray-700 p-4"
                >
                  <div className="flex items-center justify-between border-b dark:border-gray-600 pb-4">
                    <div>
                      <div className="mb-2 flex items-center">
                        <p className="text-gray-900 dark:text-gray-100">{suscripcion.socio.nombre} {suscripcion.socio.apellido}</p>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{suscripcion.plan.nombre}</p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${statusClasses}`}>
                      {statusLabel}
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Inicio: {formatFechaBuenosAires(suscripcion.fechaInicio)}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Fin: {formatFechaBuenosAires(suscripcion.fechaFin)}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      {isActive && (
                        <button
                          onClick={() => handleCancel(suscripcion.id)}
                          className="rounded-md border border-gray-300 dark:border-gray-600 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400"
                          title="Cancelar Suscripción"
                        >
                          🚫
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <table className="hidden min-w-full text-gray-900 dark:text-gray-100 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6 text-gray-900 dark:text-gray-100">Socio</th>
                <th scope="col" className="px-3 py-5 font-medium">Plan</th>
                <th scope="col" className="px-3 py-5 font-medium">Fecha Inicio</th>
                <th scope="col" className="px-3 py-5 font-medium">Fecha Fin</th>
                <th scope="col" className="px-3 py-5 font-medium">Estado</th>
                <th scope="col" className="relative py-3 pl-6 pr-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700">
              {suscripciones.map((suscripcion) => {
                const isExpired = suscripcion.fechaFin < now;
                const isActive = suscripcion.activa && !isExpired;
                const statusLabel = isActive ? 'Activa' : isExpired ? 'Vencida' : 'Inactiva';
                const statusClasses = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

                return (
                  <tr
                    key={suscripcion.id}
                    className="w-full border-b border-gray-200 dark:border-gray-600 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <p>{suscripcion.socio.nombre} {suscripcion.socio.apellido}</p>
                      </div>
                      <p className="text-xs text-gray-500">{suscripcion.socio.dni}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{suscripcion.plan.nombre}</td>
                    <td className="whitespace-nowrap px-3 py-3">{formatFechaBuenosAires(suscripcion.fechaInicio)}</td>
                    <td className="whitespace-nowrap px-3 py-3">{formatFechaBuenosAires(suscripcion.fechaFin)}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className={`inline-flex px-2 py-1 text-xs rounded-full ${statusClasses}`}>
                        {statusLabel}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        {isActive && (
                          <button
                            onClick={() => handleCancel(suscripcion.id)}
                            className="rounded-md border p-2 hover:bg-gray-100 text-red-600"
                            title="Cancelar Suscripción"
                          >
                            🚫
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
