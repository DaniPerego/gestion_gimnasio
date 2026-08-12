'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UsuariosDB } from '@/lib/db';

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
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rol = formData.get('rol') as string;

    const errors: Record<string, string[]> = {};
    if (!nombre?.trim()) errors.nombre = ['El nombre es obligatorio'];
    if (!email?.trim()) errors.email = ['El email es obligatorio'];
    if (!password || password.length < 6) errors.password = ['La contraseña debe tener al menos 6 caracteres'];
    if (!rol) errors.rol = ['El rol es obligatorio'];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsPending(false);
      return;
    }

    try {
      UsuariosDB.create({
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        rol,
        permisoSocios: formData.get('permisoSocios') === 'on',
        permisoPlanes: formData.get('permisoPlanes') === 'on',
        permisoSuscripciones: formData.get('permisoSuscripciones') === 'on',
        permisoAsistencias: formData.get('permisoAsistencias') === 'on',
        permisoReportes: formData.get('permisoReportes') === 'on',
        permisoConfiguracion: formData.get('permisoConfiguracion') === 'on',
        permisoUsuarios: formData.get('permisoUsuarios') === 'on',
        permisoTransacciones: formData.get('permisoTransacciones') === 'on',
        esProfesorCrossfit: false,
        esProfesorMusculacion: false,
      });
      router.push('/admin/usuarios');
    } catch {
      setError('Error al crear el usuario. El email podría estar duplicado.');
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
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="nombre" name="nombre" type="text" placeholder="Ingrese el nombre" required
            className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          {fieldErrors.nombre && fieldErrors.nombre.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email" name="email" type="email" placeholder="Ingrese el email" required
            className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          {fieldErrors.email && fieldErrors.email.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <input
            id="password" name="password" type="password" placeholder="Ingrese la contraseña" required
            className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          {fieldErrors.password && fieldErrors.password.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="rol" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Rol <span className="text-red-500">*</span>
          </label>
          <select
            id="rol" name="rol" defaultValue="" required
            className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          >
            <option value="" disabled>Seleccione un rol</option>
            <option value="ADMIN">Administrador</option>
            <option value="RECEPCIONISTA">Recepcionista</option>
            <option value="PROFESOR_MUSCULACION">Profesor de Musculación</option>
            <option value="PROFESOR_CROSSFIT">Profesor de Crossfit</option>
            <option value="PROFESOR_FUNCIONAL">Profesor de Funcional</option>
          </select>
          {fieldErrors.rol && fieldErrors.rol.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">Permisos de Acceso</span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ['permisoSocios', 'Gestión de Socios'],
              ['permisoPlanes', 'Gestión de Planes'],
              ['permisoSuscripciones', 'Gestión de Suscripciones'],
              ['permisoAsistencias', 'Control de Asistencias'],
              ['permisoTransacciones', 'Caja y Transacciones'],
              ['permisoReportes', 'Ver Reportes'],
              ['permisoConfiguracion', 'Configuración del Sistema'],
              ['permisoUsuarios', 'Gestión de Usuarios'],
            ].map(([name, label]) => (
              <div key={name} className="flex items-center">
                <input id={name} name={name} type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                <label htmlFor={name} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">{label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <Link
          href="/admin/usuarios"
          className="flex h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Cancelar
        </Link>
        <button
          type="submit" disabled={isPending}
          className="flex h-10 items-center justify-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creando...' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
}
