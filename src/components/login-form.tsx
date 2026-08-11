'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth-simple';
import { seedDemoData } from '@/lib/seed-demo';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setError('Por favor ingrese email y contraseña.');
      setLoading(false);
      return;
    }

    // Ensure demo data exists
    seedDemoData();

    const user = login(email, password);
    if (!user) {
      setError('Credenciales inválidas.');
      setLoading(false);
      return;
    }

    router.push('/admin');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        {error && (
          <div className="flex h-8 items-end space-x-1 mt-2" aria-live="polite">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
      </div>
    </form>
  );
}
