
'use client';
import Link from 'next/link';
import { useActionState } from 'react';
// import SearchInput from '@/components/ui/search-input';
import { createSuscripcion } from '@/lib/actions-suscripciones';
import { Socio, Plan } from '@/lib/db';

// Definir un tipo Plan serializable donde 'precio' es number en lugar de Decimal
type PlanSerializable = Omit<Plan, 'precio'> & { precio: number };


  export default function Form({ socios, planes }: { socios: Socio[], planes: PlanSerializable[] }) {
    const initialState = { message: '', errors: {} };
    const [state, dispatch, isPending] = useActionState(createSuscripcion, initialState);

    return (
      <form action={dispatch}>
        <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4 md:p-6">
          {/* Socio */}
          <div className="mb-4">
            <label htmlFor="socioId" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Seleccionar Socio
            </label>
            <div className="relative">
              <select
                id="socioId"
                name="socioId"
                className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                defaultValue=""
                aria-describedby="socio-error"
              >
                <option value="" disabled>
                  Seleccione un socio
                </option>
                {socios.map((socio) => (
                  <option key={socio.id} value={socio.id}>
                    {socio.nombre} {socio.apellido} - {socio.dni}
                  </option>
                ))}
              </select>
            </div>
            <div id="socio-error" aria-live="polite" aria-atomic="true">
              {state.errors?.socioId &&
                state.errors.socioId.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

        {/* Plan */}
        <div className="mb-4">
          <label htmlFor="planId" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Seleccionar Plan
          </label>
          <div className="relative">
            <select
              id="planId"
              name="planId"
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              defaultValue=""
              aria-describedby="plan-error"
            >
              <option value="" disabled>
                Seleccione un plan
              </option>
              {planes.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre} - ${Number(plan.precio)} ({plan.duracionMeses} meses)
                </option>
              ))}
            </select>
          </div>
          <div id="plan-error" aria-live="polite" aria-atomic="true">
            {state.errors?.planId &&
              state.errors.planId.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Fecha Inicio */}
        <div className="mb-4">
          <label htmlFor="fechaInicio" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Fecha de Inicio
          </label>
          <div className="relative">
            <input
              id="fechaInicio"
              name="fechaInicio"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              aria-describedby="fecha-error"
            />
          </div>
          <div id="fecha-error" aria-live="polite" aria-atomic="true">
            {state.errors?.fechaInicio &&
              state.errors.fechaInicio.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
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
        <button type="submit" aria-disabled={isPending} className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {isPending ? 'Creando...' : 'Crear Suscripción'}
        </button>
      </div>
    </form>
  );
}
