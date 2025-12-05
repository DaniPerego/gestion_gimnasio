'use client';

import { createProducto } from '@/actions/productos-actions';
import Link from 'next/link';
import { useFormState } from 'react-dom';

export default function Form() {
  const initialState = { message: '', errors: {} };
  const [state, dispatch] = useFormState(createProducto, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6 dark:bg-gray-900">
        {/* Nombre */}
        <div className="mb-4">
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Nombre del Producto
          </label>
          <div className="relative mt-2 rounded-md">
            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Ej. Agua Mineral 500ml"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
          <div id="nombre-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nombre &&
              state.errors.nombre.map((error: string) => (
                <p key={error} className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label htmlFor="descripcion" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Descripción
          </label>
          <div className="relative mt-2 rounded-md">
            <textarea
              id="descripcion"
              name="descripcion"
              placeholder="Descripción del producto..."
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Precio */}
        <div className="mb-4">
          <label htmlFor="precio" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Precio
          </label>
          <div className="relative mt-2 rounded-md">
            <input
              id="precio"
              name="precio"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
          <div id="precio-error" aria-live="polite" aria-atomic="true">
            {state.errors?.precio &&
              state.errors.precio.map((error: string) => (
                <p key={error} className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Stock */}
        <div className="mb-4">
          <label htmlFor="stock" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Stock Inicial
          </label>
          <div className="relative mt-2 rounded-md">
            <input
              id="stock"
              name="stock"
              type="number"
              placeholder="0"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
          <div id="stock-error" aria-live="polite" aria-atomic="true">
            {state.errors?.stock &&
              state.errors.stock.map((error: string) => (
                <p key={error} className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Código */}
        <div className="mb-4">
          <label htmlFor="codigo" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Código (Opcional)
          </label>
          <div className="relative mt-2 rounded-md">
            <input
              id="codigo"
              name="codigo"
              type="text"
              placeholder="Código de barras o interno"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div id="codigo-error" aria-live="polite" aria-atomic="true">
            {state.errors?.codigo &&
              state.errors.codigo.map((error: string) => (
                <p key={error} className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Activo */}
        <div className="mb-4">
            <div className="flex items-center">
                <input
                    id="activo"
                    name="activo"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
                />
                <label htmlFor="activo" className="ml-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Producto Activo
                </label>
            </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/productos"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Crear Producto
        </button>
      </div>
      {state.message && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400">
          {state.message}
        </div>
      )}
    </form>
  );
}
