'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { updateUsuario } from '@/lib/actions-usuarios';
import { Usuario } from '@/lib/db';

export default function EditForm({ usuario }: { usuario: Usuario }) {
  const initialState = { message: '', errors: {} };
  const updateUserWithId = updateUsuario.bind(null, usuario.id);
  const [state, dispatch, isPending] = useActionState(updateUserWithId, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nombre */}
        <div className="mb-4">
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-gray-900">
            Nombre
          </label>
          <div className="relative">
            <input
              id="nombre"
              name="nombre"
              type="text"
              defaultValue={usuario.nombre || ''}
              placeholder="Ingrese el nombre"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="name-error"
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
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={usuario.email || ''}
              placeholder="Ingrese el email"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="email-error"
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

        {/* Rol */}
        <div className="mb-4">
          <label htmlFor="rol" className="mb-2 block text-sm font-medium text-gray-900">
            Rol
          </label>
          <div className="relative">
            <select
              id="rol"
              name="rol"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={usuario.rol}
              aria-describedby="role-error"
            >
              <option value="ADMIN">Administrador</option>
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="PROFESOR">Profesor</option>
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
          <span className="mb-2 block text-sm font-medium text-gray-900">
            Permisos de Acceso
          </span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center">
              <input
                id="permisoSocios"
                name="permisoSocios"
                type="checkbox"
                defaultChecked={usuario.permisoSocios}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoSocios" className="ml-2 block text-sm text-gray-900">
                Gestión de Socios
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoPlanes"
                name="permisoPlanes"
                type="checkbox"
                defaultChecked={usuario.permisoPlanes}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoPlanes" className="ml-2 block text-sm text-gray-900">
                Gestión de Planes
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoSuscripciones"
                name="permisoSuscripciones"
                type="checkbox"
                defaultChecked={usuario.permisoSuscripciones}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoSuscripciones" className="ml-2 block text-sm text-gray-900">
                Gestión de Suscripciones
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoAsistencias"
                name="permisoAsistencias"
                type="checkbox"
                defaultChecked={usuario.permisoAsistencias}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoAsistencias" className="ml-2 block text-sm text-gray-900">
                Control de Asistencias
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoTransacciones"
                name="permisoTransacciones"
                type="checkbox"
                defaultChecked={usuario.permisoTransacciones}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoTransacciones" className="ml-2 block text-sm text-gray-900">
                Caja y Transacciones
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoReportes"
                name="permisoReportes"
                type="checkbox"
                defaultChecked={usuario.permisoReportes}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoReportes" className="ml-2 block text-sm text-gray-900">
                Ver Reportes
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoConfiguracion"
                name="permisoConfiguracion"
                type="checkbox"
                defaultChecked={usuario.permisoConfiguracion}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoConfiguracion" className="ml-2 block text-sm text-gray-900">
                Configuración del Sistema
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permisoUsuarios"
                name="permisoUsuarios"
                type="checkbox"
                defaultChecked={usuario.permisoUsuarios}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="permisoUsuarios" className="ml-2 block text-sm text-gray-900">
                Gestión de Usuarios
              </label>
            </div>
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
          href="/admin/usuarios"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button type="submit" aria-disabled={isPending} className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
