'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';

export default function LoginForm() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 dark:bg-gray-900 px-6 pb-4 pt-8 transition-colors">
        <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          Iniciar Sesión
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-300"
              htmlFor="email"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
                id="email"
                type="email"
                name="email"
                placeholder="Ingresa tu correo"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-300"
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
                id="password"
                type="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                required
                minLength={6}
              />
            </div>
          </div>
        </div>
        <LoginButton />
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-400 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
      aria-disabled={pending}
    >
      Ingresar
    </button>
  );
}
