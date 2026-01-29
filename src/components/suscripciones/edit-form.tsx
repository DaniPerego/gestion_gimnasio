'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { updateSuscripcion } from '@/lib/actions-suscripciones';
import { Socio, Plan, Suscripcion } from '@prisma/client';

type PlanSerializable = Omit<Plan, 'precio'> & { precio: number };
type SuscripcionWithRelations = Suscripcion & { socio: Socio; plan: PlanSerializable };

interface FormState {
  message: string;
  errors?: {
    socioId?: string[];
    planId?: string[];
    fechaInicio?: string[];
    fechaFin?: string[];
    monto?: string[];
  };
}

export default function EditForm({ suscripcion }: { suscripcion: SuscripcionWithRelations }) {
  const initialState: FormState = { message: '', errors: {} };
  const updateSuscripcionWithId = updateSuscripcion.bind(null, suscripcion.id);
  const [state, dispatch, isPending] = useActionState(updateSuscripcionWithId, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Socio (Read-only) */}
        <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Socio</label>
            <input 
                type="text" 
                disabled 
                value={`${suscripcion.socio.nombre} ${suscripcion.socio.apellido}`}
                className="block w-full rounded-md border border-gray-200 bg-gray-100 py-2 pl-3 text-sm text-gray-500"
            />
        </div>

        {/* Plan (Read-only) */}
        <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">Plan</label>
            <input 
                type="text" 
                disabled 
                value={suscripcion.plan.nombre}
                className="block w-full rounded-md border border-gray-200 bg-gray-100 py-2 pl-3 text-sm text-gray-500"
            />
        </div>

        {/* Fecha Inicio */}
        <div className="mb-4">
          <label htmlFor="fechaInicio" className="mb-2 block text-sm font-medium">
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

        {/* Fecha Fin */}
        <div className="mb-4">
          <label htmlFor="fechaFin" className="mb-2 block text-sm font-medium">
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
        
        <div aria-live="polite" aria-atomic="true">
            {state.message && (
                <p className="mt-2 text-sm text-red-500" key={state.message}>
                    {state.message}
                </p>
            )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/suscripciones"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button type="submit" aria-disabled={isPending} className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}