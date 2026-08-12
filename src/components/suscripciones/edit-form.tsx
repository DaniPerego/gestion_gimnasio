'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SuscripcionesDB, Socio, Plan, Suscripcion } from '@/lib/db';

type PlanSerializable = Omit<Plan, 'precio'> & { precio: number };
type SuscripcionWithRelations = Suscripcion & { socio: Socio; plan: PlanSerializable };

export default function EditForm({ suscripcion }: { suscripcion: SuscripcionWithRelations }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const fechaInicio = formData.get('fechaInicio') as string;
    const fechaFin = formData.get('fechaFin') as string;

    if (!fechaInicio || !fechaFin) {
      setError('Las fechas de inicio y fin son obligatorias.');
      setIsPending(false);
      return;
    }

    try {
      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinDate = new Date(fechaFin);
      fechaFinDate.setHours(23, 59, 59, 999);

      SuscripcionesDB.update({ id: suscripcion.id }, {
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
      });
      router.push('/admin/suscripciones');
    } catch {
      setError('Error al actualizar la suscripción. Intente nuevamente.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium text-gray-900">Socio</span>
          <input
            type="text"
            disabled
            value={`${suscripcion.socio.nombre} ${suscripcion.socio.apellido}`}
            className="block w-full rounded-md border border-gray-200 bg-gray-100 py-2 pl-3 text-sm text-gray-500"
          />
        </div>

        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium text-gray-900">Plan</span>
          <input
            type="text"
            disabled
            value={suscripcion.plan.nombre}
            className="block w-full rounded-md border border-gray-200 bg-gray-100 py-2 pl-3 text-sm text-gray-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="fechaInicio" className="mb-2 block text-sm font-medium text-gray-900">
            Fecha de Inicio
          </label>
          <input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            defaultValue={new Date(suscripcion.fechaInicio).toISOString().split('T')[0]}
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="fechaFin" className="mb-2 block text-sm font-medium text-gray-900">
            Fecha de Fin
          </label>
          <input
            id="fechaFin"
            name="fechaFin"
            type="date"
            defaultValue={new Date(suscripcion.fechaFin).toISOString().split('T')[0]}
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/suscripciones"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button type="submit" disabled={isPending} className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50">
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
