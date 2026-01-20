'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { updatePlan } from '@/lib/actions-planes';
import { Plan } from '@prisma/client';

type PlanSerializable = Omit<Plan, 'precio'> & { precio: number };

export default function EditForm({ plan }: { plan: PlanSerializable }) {
  const initialState = { message: '', errors: {} };
  const updatePlanWithId = updatePlan.bind(null, plan.id);
  const [state, dispatch, isPending] = useActionState(updatePlanWithId, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nombre */}
        <div className="mb-4">
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium">
            Nombre del Plan
          </label>
          <div className="relative">
            <input
              id="nombre"
              name="nombre"
              type="text"
              defaultValue={plan.nombre}
              placeholder="Ej. Plan Mensual"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nombre-error"
            />
          </div>
          <div id="nombre-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nombre &&
              state.errors.nombre.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Descripcion */}
        <div className="mb-4">
          <label htmlFor="descripcion" className="mb-2 block text-sm font-medium">
            Descripción
          </label>
          <div className="relative">
            <input
              id="descripcion"
              name="descripcion"
              type="text"
              defaultValue={plan.descripcion || ''}
              placeholder="Breve descripción"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Precio */}
        <div className="mb-4">
          <label htmlFor="precio" className="mb-2 block text-sm font-medium">
            Precio
          </label>
          <div className="relative">
            <input
              id="precio"
              name="precio"
              type="number"
              step="0.01"
              defaultValue={Number(plan.precio)}
              placeholder="0.00"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="precio-error"
            />
          </div>
          <div id="precio-error" aria-live="polite" aria-atomic="true">
            {state.errors?.precio &&
              state.errors.precio.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Duracion */}
        <div className="mb-4">
          <label htmlFor="duracionMeses" className="mb-2 block text-sm font-medium">
            Duración (Meses)
          </label>
          <div className="relative">
            <input
              id="duracionMeses"
              name="duracionMeses"
              type="number"
              defaultValue={plan.duracionMeses}
              placeholder="1"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="duracion-error"
            />
          </div>
          <div id="duracion-error" aria-live="polite" aria-atomic="true">
            {state.errors?.duracionMeses &&
              state.errors.duracionMeses.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <hr className="my-6 border-gray-200" />
        <h3 className="mb-4 text-lg font-medium text-gray-900">Disciplinas Permitidas</h3>

        {/* Allows Musculacion */}
        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="allowsMusculacion"
              name="allowsMusculacion"
              type="checkbox"
              defaultChecked={plan.allowsMusculacion}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="allowsMusculacion" className="ml-2 block text-sm text-gray-900">
              Musculación
            </label>
          </div>
        </div>

        {/* Allows Crossfit */}
        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="allowsCrossfit"
              name="allowsCrossfit"
              type="checkbox"
              defaultChecked={plan.allowsCrossfit}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="allowsCrossfit" className="ml-2 block text-sm text-gray-900">
              Crossfit
            </label>
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
          href="/admin/planes"
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
