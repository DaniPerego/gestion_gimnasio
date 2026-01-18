'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { createSocio } from '@/lib/actions-socios';

import { useRef } from 'react';

type StateType = {
  message: string;
  errors: Record<string, string[]>;
  values: Record<string, string>;
};

export default function Form() {
  const initialState: StateType = { message: '', errors: {}, values: {} };
  const [state, dispatch, isPending] = useActionState<StateType, FormData>(createSocio, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  return (
    <form ref={formRef} action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Mostrar errores generales y de campos */}
        {state.message && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {state.message}
            {state.errors && (
              <ul className="mt-2 list-disc list-inside text-sm">
                {Object.entries(state.errors).map(([field, errors]) =>
                  errors.map((err: string) => <li key={field + err}>{field}: {err}</li>)
                )}
              </ul>
            )}
          </div>
        )}
        {/* Nombre (obligatorio) */}
        <div className="mb-4">
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-gray-900">
            Nombre <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Ingrese el nombre"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nombre-error"
              autoComplete="given-name"
              defaultValue={state.values?.nombre}
              required
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

        {/* Apellido (obligatorio) */}
        <div className="mb-4">
          <label htmlFor="apellido" className="mb-2 block text-sm font-medium text-gray-900">
            Apellido <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="apellido"
              name="apellido"
              type="text"
              placeholder="Ingrese el apellido"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="apellido-error"
              autoComplete="family-name"
              defaultValue={state.values?.apellido}
              required
            />
          </div>
          <div id="apellido-error" aria-live="polite" aria-atomic="true">
            {state.errors?.apellido &&
              state.errors.apellido.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* DNI (obligatorio) */}
        <div className="mb-4">
          <label htmlFor="dni" className="mb-2 block text-sm font-medium text-gray-900">
            DNI <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="dni"
              name="dni"
              type="text"
              placeholder="Ingrese el DNI"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="dni-error"
              autoComplete="off"
              defaultValue={state.values?.dni}
              required
            />
          </div>
          <div id="dni-error" aria-live="polite" aria-atomic="true">
            {state.errors?.dni &&
              state.errors.dni.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Fecha Nacimiento */}
        <div className="mb-4">
          <label htmlFor="fechaNacimiento" className="mb-2 block text-sm font-medium text-gray-900">
            Fecha de Nacimiento
          </label>
          <div className="relative">
            <input
              id="fechaNacimiento"
              name="fechaNacimiento"
              type="date"
              autoComplete="bday"
              defaultValue={state.values?.fechaNacimiento}
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Género */}
        <div className="mb-4">
          <label htmlFor="genero" className="mb-2 block text-sm font-medium text-gray-900">
            Género
          </label>
          <div className="relative">
            <select
              id="genero"
              name="genero"
              autoComplete="sex"
              defaultValue={state.values?.genero}
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            >
              <option value="">Seleccione...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
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
              placeholder="Ingrese el email"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              autoComplete="email"
              defaultValue={state.values?.email}
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

        {/* Telefono */}
        <div className="mb-4">
          <label htmlFor="telefono" className="mb-2 block text-sm font-medium text-gray-900">
            Teléfono
          </label>
          <div className="relative">
            <input
              id="telefono"
              name="telefono"
              type="text"
              placeholder="Ingrese el teléfono"
              autoComplete="tel"
              defaultValue={state.values?.telefono}
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Dirección */}
        <div className="mb-4">
          <label htmlFor="direccion" className="mb-2 block text-sm font-medium text-gray-900">
            Dirección
          </label>
          <div className="relative">
            <input
              id="direccion"
              name="direccion"
              type="text"
              placeholder="Ingrese la dirección"
              autoComplete="street-address"
              defaultValue={state.values?.direccion}
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-200" />
        <h3 className="mb-4 text-lg font-medium text-gray-900">Datos de Emergencia</h3>

        {/* Contacto Emergencia (obligatorio) */}
        <div className="mb-4">
          <label htmlFor="contactoEmergencia" className="mb-2 block text-sm font-medium text-gray-900">
            Nombre Contacto Emergencia <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="contactoEmergencia"
              name="contactoEmergencia"
              type="text"
              placeholder="Nombre de familiar o amigo"
              autoComplete="off"
              defaultValue={state.values?.contactoEmergencia}
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              required
            />
          </div>
        </div>

        {/* Teléfono Emergencia */}
        <div className="mb-4">
          <label htmlFor="telefonoEmergencia" className="mb-2 block text-sm font-medium text-gray-900">
            Teléfono Emergencia
          </label>
          <div className="relative">
            <input
              id="telefonoEmergencia"
              name="telefonoEmergencia"
              type="text"
              placeholder="Teléfono de emergencia"
              autoComplete="off"
              defaultValue={state.values?.telefonoEmergencia}
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-200" />
        <h3 className="mb-4 text-lg font-medium text-gray-900">Salud y Objetivos</h3>

        {/* Condiciones Médicas (obligatorio) */}
        <div className="mb-4">
          <label htmlFor="condicionesMedicas" className="mb-2 block text-sm font-medium text-gray-900">
            Condiciones Médicas / Alergias <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              id="condicionesMedicas"
              name="condicionesMedicas"
              placeholder="Describa condiciones médicas relevantes..."
              defaultValue={state.values?.condicionesMedicas}
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Objetivo */}
        <div className="mb-4">
          <label htmlFor="objetivo" className="mb-2 block text-sm font-medium text-gray-900">
            Objetivo Principal
          </label>
          <div className="relative">
            <input
              id="objetivo"
              name="objetivo"
              type="text"
              placeholder="Ej: Bajar de peso, Ganar masa muscular..."
              defaultValue={state.values?.objetivo}
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="esLibre"
              name="esLibre"
              type="checkbox"
              defaultChecked={state.values?.esLibre === true}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="esLibre" className="ml-2 block text-sm font-medium text-gray-900">
              Socio Libre (Acceso gratuito/ilimitado)
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Si se marca, el socio tendrá acceso permitido siempre, sin necesidad de suscripción.
          </p>
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
          href="/admin/socios"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button type="submit" aria-disabled={isPending} className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {isPending ? 'Creando...' : 'Crear Socio'}
        </button>
      </div>
    </form>
  );
}
