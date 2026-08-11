'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { createUsuario } from '@/lib/actions-usuarios';

export default function Form() {
  const initialState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(createUsuario, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4 md:p-6">
        {/* Mostrar mensaje de error general */}
        {state.message && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
            {state.message}
          </div>
        )}
        
        {/* Nombre */}
        <div className="mb-4">
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Nombre <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Ingrese el nombre"
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              aria-describedby="name-error"
              required
            />
          </div>
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nombre &&
              state.errors.nombre.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Ingrese el email"
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              aria-describedby="email-error"
              required
            />
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Ingrese la contraseña"
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              aria-describedby="password-error"
              required
            />
          </div>
          <div id="password-error" aria-live="polite" aria-atomic="true">
            {state.errors?.password &&
              state.errors.password.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Rol */}
        <div className="mb-4">
          <label htmlFor="rol" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Rol <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="rol"
              name="rol"
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              defaultValue=""
              aria-describedby="role-error"
              required
            >
              <option value="" disabled>
                Seleccione un rol
              </option>
              <option value="ADMIN">Administrador</option>
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="PROFESOR_MUSCULACION">Profesor de Musculación</option>
              <option value="PROFESOR_CROSSFIT">Profesor de Crossfit</option>
              <option value="PROFESOR_FUNCIONAL">Profesor de Funcional</option>
            </select>
          </div>
          <div id="role-error" aria-live="polite" aria-atomic="true">
            {state.errors?.rol &&
              state.errors.rol.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Permisos */}
        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Permisos de Acceso
          </span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center">
              <input
                id="permisoSocios"
                name="permisoSocios"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoSocios" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Gestión de Socios
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoPlanes"
                name="permisoPlanes"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoPlanes" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Gestión de Planes
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoSuscripciones"
                name="permisoSuscripciones"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoSuscripciones" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Gestión de Suscripciones
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoAsistencias"
                name="permisoAsistencias"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoAsistencias" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Control de Asistencias
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoTransacciones"
                name="permisoTransacciones"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoTransacciones" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Caja y Transacciones
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoReportes"
                name="permisoReportes"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoReportes" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Ver Reportes
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoConfiguracion"
                name="permisoConfiguracion"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoConfiguracion" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Configuración del Sistema
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoUsuarios"
                name="permisoUsuarios"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoUsuarios" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Gestión de Usuarios
              </label>
            </div>
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
          type="submit" 
          disabled={isPending}
          className="flex h-10 items-center justify-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creando...' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
}
