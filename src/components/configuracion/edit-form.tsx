'use client';

import { useActionState } from 'react';
import { updateConfiguracion } from '@/lib/actions-configuracion';
import { Configuracion } from '@prisma/client';

export default function ConfigForm({ config }: { config: Configuracion | null }) {
  const initialState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(updateConfiguracion, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nombre del Gimnasio */}
        <div className="mb-4">
          <label htmlFor="nombreGimnasio" className="mb-2 block text-sm font-medium">
            Nombre del Gimnasio
          </label>
          <div className="relative">
            <input
              id="nombreGimnasio"
              name="nombreGimnasio"
              type="text"
              defaultValue={config?.nombreGimnasio || ''}
              placeholder="Mi Gimnasio"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nombre-error"
            />
          </div>
          <div id="nombre-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nombreGimnasio &&
              state.errors.nombreGimnasio.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Color Primario */}
        <div className="mb-4">
          <label htmlFor="colorPrimario" className="mb-2 block text-sm font-medium">
            Color Primario (Sidebar)
          </label>
          <div className="flex items-center gap-4">
            <input
              id="colorPrimario"
              name="colorPrimario"
              type="color"
              defaultValue={config?.colorPrimario || '#000000'}
              className="h-10 w-20 cursor-pointer rounded border border-gray-200 p-1"
            />
            <input 
                type="text" 
                readOnly 
                value={config?.colorPrimario || '#000000'} // Simple display, ideally synced with state but defaultValue works for SSR
                className="rounded-md border border-gray-200 py-2 pl-3 text-sm text-gray-500"
            />
          </div>
           <div id="colorPrimario-error" aria-live="polite" aria-atomic="true">
            {state.errors?.colorPrimario &&
              state.errors.colorPrimario.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Color Secundario */}
        <div className="mb-4">
          <label htmlFor="colorSecundario" className="mb-2 block text-sm font-medium">
            Color Secundario (Logo/Acentos)
          </label>
          <div className="flex items-center gap-4">
            <input
              id="colorSecundario"
              name="colorSecundario"
              type="color"
              defaultValue={config?.colorSecundario || '#ffffff'}
              className="h-10 w-20 cursor-pointer rounded border border-gray-200 p-1"
            />
             <input 
                type="text" 
                readOnly 
                value={config?.colorSecundario || '#ffffff'}
                className="rounded-md border border-gray-200 py-2 pl-3 text-sm text-gray-500"
            />
          </div>
          <div id="colorSecundario-error" aria-live="polite" aria-atomic="true">
            {state.errors?.colorSecundario &&
              state.errors.colorSecundario.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
            {state.message && (
                <p className={`mt-2 text-sm ${state.message.includes('correctamente') ? 'text-green-600' : 'text-red-500'}`} key={state.message}>
                    {state.message}
                </p>
            )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button type="submit" aria-disabled={isPending} className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {isPending ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  );
}
