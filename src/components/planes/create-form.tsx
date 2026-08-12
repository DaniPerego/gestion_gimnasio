'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PlanesDB } from '@/lib/db';

export default function Form() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    const nombre = formData.get('nombre') as string;
    const descripcion = formData.get('descripcion') as string;
    const precio = formData.get('precio') as string;
    const duracionMeses = formData.get('duracionMeses') as string;
    const allowsMusculacion = formData.get('allowsMusculacion') === 'on';
    const allowsCrossfit = formData.get('allowsCrossfit') === 'on';

    const errors: Record<string, string[]> = {};
    if (!nombre?.trim()) errors.nombre = ['El nombre es obligatorio'];
    if (!precio || isNaN(Number(precio))) errors.precio = ['El precio es obligatorio'];
    if (!duracionMeses || isNaN(Number(duracionMeses)) || Number(duracionMeses) < 1) errors.duracionMeses = ['La duración debe ser al menos 1'];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsPending(false);
      return;
    }

    try {
      PlanesDB.create({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        precio: Number(precio),
        duracionMeses: Number(duracionMeses),
        activo: true,
        allowsMusculacion,
        allowsCrossfit,
      });
      router.push('/admin/planes');
    } catch {
      setError('Error al crear el plan. Intente nuevamente.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4 md:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Nombre del Plan
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Ej. Plan Mensual"
            className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            aria-describedby="nombre-error"
          />
          {fieldErrors.nombre && fieldErrors.nombre.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="descripcion" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Descripción
          </label>
          <input
            id="descripcion"
            name="descripcion"
            type="text"
            placeholder="Breve descripción"
            className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="precio" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Precio
          </label>
          <input
            id="precio"
            name="precio"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            aria-describedby="precio-error"
          />
          {fieldErrors.precio && fieldErrors.precio.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="duracionMeses" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Duración (meses)
          </label>
          <input
            id="duracionMeses"
            name="duracionMeses"
            type="number"
            min="1"
            placeholder="1"
            className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            aria-describedby="duracion-error"
          />
          {fieldErrors.duracionMeses && fieldErrors.duracionMeses.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Disciplinas Permitidas
          </span>
          <div className="flex gap-4">
            <div className="flex items-center">
              <input
                id="allowsMusculacion"
                name="allowsMusculacion"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="allowsMusculacion" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Musculación
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="allowsCrossfit"
                name="allowsCrossfit"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="allowsCrossfit" className="ml-2 block text-sm text-gray-900">
                Crossfit
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/planes"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button type="submit" disabled={isPending} className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50">
          {isPending ? 'Creando...' : 'Crear Plan'}
        </button>
      </div>
    </form>
  );
}
