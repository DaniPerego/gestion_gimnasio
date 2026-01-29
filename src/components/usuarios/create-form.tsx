'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { createUsuario } from '@/lib/actions-usuarios';

interface FormState {
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
    nombre?: string[];
    rol?: string[];
  };
}

export default function Form() {
  const initialState: FormState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(createUsuario, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nombre */}
        <div className="mb-4">
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium">
            Nombre Completo
          </label>
          <div className="relative">
            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Ingrese el nombre del usuario"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nombre-error"
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

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Ingrese el email"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="email-error"
            />
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p key={error} className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Ingrese la contraseña"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="password-error"
            />
          </div>
          <div id="password-error" aria-live="polite" aria-atomic="true">
            {state.errors?.password &&
              state.errors.password.map((error: string) => (
                <p key={error} className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Rol */}
        <div className="mb-4">
          <label htmlFor="rol" className="mb-2 block text-sm font-medium">
            Rol
          </label>
          <div className="relative">
            <select
              id="rol"
              name="rol"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="rol-error"
            >
              <option value="" disabled>
                Seleccione un rol
              </option>
              <option value="ADMIN">Administrador</option>
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="ENTRENADOR">Entrenador</option>
            </select>
          </div>
          <div id="rol-error" aria-live="polite" aria-atomic="true">
            {state.errors?.rol &&
              state.errors.rol.map((error: string) => (
                <p key={error} className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Permisos de Acceso */}
        <div className="mb-4 border-t pt-4">
            <h3 className="mb-3 block text-sm font-medium text-gray-900">Permisos de Acceso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                    <input id="permisoSocios" name="permisoSocios" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="permisoSocios" className="ml-2 block text-sm text-gray-900">Socios</label>
                </div>
                <div className="flex items-center">
                    <input id="permisoPlanes" name="permisoPlanes" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="permisoPlanes" className="ml-2 block text-sm text-gray-900">Planes</label>
                </div>
                <div className="flex items-center">
                    <input id="permisoSuscripciones" name="permisoSuscripciones" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="permisoSuscripciones" className="ml-2 block text-sm text-gray-900">Suscripciones</label>
                </div>
                <div className="flex items-center">
                    <input id="permisoAsistencias" name="permisoAsistencias" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="permisoAsistencias" className="ml-2 block text-sm text-gray-900">Asistencias</label>
                </div>
                <div className="flex items-center">
                    <input id="permisoReportes" name="permisoReportes" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="permisoReportes" className="ml-2 block text-sm text-gray-900">Reportes</label>
                </div>
                <div className="flex items-center">
                    <input id="permisoConfiguracion" name="permisoConfiguracion" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="permisoConfiguracion" className="ml-2 block text-sm text-gray-900">Configuración</label>
                </div>
                <div className="flex items-center">
                    <input id="permisoUsuarios" name="permisoUsuarios" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="permisoUsuarios" className="ml-2 block text-sm text-gray-900">Usuarios</label>
                </div>
                <div className="flex items-center">
                    <input id="permisoTransacciones" name="permisoTransacciones" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="permisoTransacciones" className="ml-2 block text-sm text-gray-900">Transacciones</label>
                </div>
            </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {state.message && (
            <p className="mt-2 text-sm text-red-500">{state.message}</p>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/usuarios"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Guardar Usuario'}
        </button>
      </div>
    </form>
  );
}
