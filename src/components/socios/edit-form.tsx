'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { updateSocio } from '@/lib/actions-socios';
import { Socio } from '@prisma/client';

interface FormState {
  message?: string;
  errors?: {
    nombre?: string[];
    apellido?: string[];
    dni?: string[];
    email?: string[];
    telefono?: string[];
    fechaNacimiento?: string[];
    genero?: string[];
    direccion?: string[];
    contactoEmergencia?: string[];
    telefonoEmergencia?: string[];
    condicionesMedicas?: string[];
    objetivo?: string[];
  };
}

export default function EditForm({ socio }: { socio: Socio }) {
  const initialState: FormState = { message: '', errors: {} };
  const updateSocioWithId = updateSocio.bind(null, socio.id);
  const [state, dispatch, isPending] = useActionState(updateSocioWithId, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nombre */}
        <div className="mb-4">
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium">
            Nombre
          </label>
          <div className="relative">
            <input
              id="nombre"
              name="nombre"
              type="text"
              defaultValue={socio.nombre}
              placeholder="Ingrese el nombre"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nombre-error"
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

        {/* Apellido */}
        <div className="mb-4">
          <label htmlFor="apellido" className="mb-2 block text-sm font-medium">
            Apellido
          </label>
          <div className="relative">
            <input
              id="apellido"
              name="apellido"
              type="text"
              defaultValue={socio.apellido}
              placeholder="Ingrese el apellido"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="apellido-error"
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

        {/* DNI */}
        <div className="mb-4">
          <label htmlFor="dni" className="mb-2 block text-sm font-medium">
            DNI
          </label>
          <div className="relative">
            <input
              id="dni"
              name="dni"
              type="text"
              defaultValue={socio.dni}
              placeholder="Ingrese el DNI"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="dni-error"
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
              defaultValue={socio.email || ''}
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

        {/* Telefono */}
        <div className="mb-4">
          <label htmlFor="telefono" className="mb-2 block text-sm font-medium">
            Teléfono
          </label>
          <div className="relative">
            <input
              id="telefono"
              name="telefono"
              type="text"
              defaultValue={socio.telefono || ''}
              placeholder="Ingrese el teléfono"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Fecha de Nacimiento */}
        <div className="mb-4">
          <label htmlFor="fechaNacimiento" className="mb-2 block text-sm font-medium">
            Fecha de Nacimiento
          </label>
          <div className="relative">
            <input
              id="fechaNacimiento"
              name="fechaNacimiento"
              type="date"
              defaultValue={socio.fechaNacimiento ? new Date(socio.fechaNacimiento).toISOString().split('T')[0] : ''}
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2"
            />
          </div>
        </div>

        {/* Género */}
        <div className="mb-4">
          <label htmlFor="genero" className="mb-2 block text-sm font-medium">
            Género
          </label>
          <div className="relative">
            <select
              id="genero"
              name="genero"
              defaultValue={socio.genero || ''}
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2"
            >
              <option value="">Seleccione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        {/* Dirección */}
        <div className="mb-4">
          <label htmlFor="direccion" className="mb-2 block text-sm font-medium">
            Dirección
          </label>
          <div className="relative">
            <input
              id="direccion"
              name="direccion"
              type="text"
              defaultValue={socio.direccion || ''}
              placeholder="Ingrese la dirección"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-200" />
        <h3 className="mb-4 text-lg font-medium text-gray-900">Datos de Emergencia</h3>

        {/* Contacto Emergencia */}
        <div className="mb-4">
          <label htmlFor="contactoEmergencia" className="mb-2 block text-sm font-medium">
            Nombre Contacto Emergencia <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="contactoEmergencia"
              name="contactoEmergencia"
              type="text"
              defaultValue={socio.contactoEmergencia || ''}
              placeholder="Nombre de familiar o amigo"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              required
            />
          </div>
        </div>

        {/* Teléfono Emergencia */}
        <div className="mb-4">
          <label htmlFor="telefonoEmergencia" className="mb-2 block text-sm font-medium">
            Teléfono Emergencia
          </label>
          <div className="relative">
            <input
              id="telefonoEmergencia"
              name="telefonoEmergencia"
              type="text"
              defaultValue={socio.telefonoEmergencia || ''}
              placeholder="Teléfono de emergencia"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-200" />
        <h3 className="mb-4 text-lg font-medium text-gray-900">Salud y Objetivos</h3>

        {/* Condiciones Médicas */}
        <div className="mb-4">
          <label htmlFor="condicionesMedicas" className="mb-2 block text-sm font-medium">
            Condiciones Médicas / Alergias <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              id="condicionesMedicas"
              name="condicionesMedicas"
              defaultValue={socio.condicionesMedicas || ''}
              placeholder="Describa condiciones médicas relevantes o escriba 'Ninguna'"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Objetivo */}
        <div className="mb-4">
          <label htmlFor="objetivo" className="mb-2 block text-sm font-medium">
            Objetivo Principal
          </label>
          <div className="relative">
            <input
              id="objetivo"
              name="objetivo"
              type="text"
              defaultValue={socio.objetivo || ''}
              placeholder="Ej: Bajar de peso, Ganar masa muscular..."
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* Es Libre */}
        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="esLibre"
              name="esLibre"
              type="checkbox"
              defaultChecked={socio.esLibre || false}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="esLibre" className="ml-2 block text-sm text-gray-900">
              Socio Libre (acceso sin vencimiento)
            </label>
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
          href="/admin/socios"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button type="submit" aria-disabled={isPending} className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
