'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SociosDB } from '@/lib/db';

export default function Form() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Validate required fields
    const errors: Record<string, string[]> = {};
    const nombre = formData.get('nombre') as string;
    const apellido = formData.get('apellido') as string;
    const dni = formData.get('dni') as string;
    const contactoEmergencia = formData.get('contactoEmergencia') as string;
    const condicionesMedicas = formData.get('condicionesMedicas') as string;

    if (!nombre?.trim()) errors.nombre = ['El nombre es obligatorio'];
    if (!apellido?.trim()) errors.apellido = ['El apellido es obligatorio'];
    if (!dni?.trim()) errors.dni = ['El DNI es obligatorio'];
    if (!contactoEmergencia?.trim()) errors.contactoEmergencia = ['El contacto de emergencia es obligatorio'];
    if (!condicionesMedicas?.trim()) errors.condicionesMedicas = ['Las condiciones médicas son obligatorias'];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsPending(false);
      return;
    }

    // Check for duplicate DNI
    const existing = SociosDB.findUnique({ dni: dni.trim() });
    if (existing) {
      setFieldErrors({ dni: ['Ya existe un socio con este DNI'] });
      setIsPending(false);
      return;
    }

    try {
      SociosDB.create({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim(),
        email: (formData.get('email') as string)?.trim() || null,
        telefono: (formData.get('telefono') as string)?.trim() || null,
        fechaNacimiento: formData.get('fechaNacimiento') ? new Date(formData.get('fechaNacimiento') as string) : null,
        genero: (formData.get('genero') as string) || null,
        direccion: (formData.get('direccion') as string)?.trim() || null,
        fotoUrl: null,
        contactoEmergencia: contactoEmergencia?.trim() || null,
        telefonoEmergencia: (formData.get('telefonoEmergencia') as string)?.trim() || null,
        condicionesMedicas: condicionesMedicas?.trim() || null,
        objetivo: (formData.get('objetivo') as string)?.trim() || null,
        activo: true,
        esLibre: false,
      });

      router.push('/admin/socios');
    } catch {
      setError('Error al crear el socio. Intente nuevamente.');
    } finally {
      setIsPending(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4 md:p-6">
        {/* Mostrar errores generales y de campos */}
        {(error || Object.keys(fieldErrors).length > 0) && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
            {error}
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm">
                {Object.entries(fieldErrors).map(([field, errs]) =>
                  errs.map((err: string) => <li key={field + err}>{field}: {err}</li>)
                )}
              </ul>
            )}
          </div>
        )}
        {/* Nombre (obligatorio) */}
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
              aria-describedby="nombre-error"
              autoComplete="given-name"
              defaultValue={values.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div id="nombre-error" aria-live="polite" aria-atomic="true">
            {fieldErrors.nombre &&
              fieldErrors.nombre.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Apellido (obligatorio) */}
        <div className="mb-4">
          <label htmlFor="apellido" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Apellido <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="apellido"
              name="apellido"
              type="text"
              placeholder="Ingrese el apellido"
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              aria-describedby="apellido-error"
              autoComplete="family-name"
              defaultValue={values.apellido}
              onChange={handleChange}
              required
            />
          </div>
          <div id="apellido-error" aria-live="polite" aria-atomic="true">
            {fieldErrors.apellido &&
              fieldErrors.apellido.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* DNI (obligatorio) */}
        <div className="mb-4">
          <label htmlFor="dni" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            DNI <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="dni"
              name="dni"
              type="text"
              placeholder="Ingrese el DNI"
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              aria-describedby="dni-error"
              autoComplete="off"
              defaultValue={values.dni}
              onChange={handleChange}
              required
            />
          </div>
          <div id="dni-error" aria-live="polite" aria-atomic="true">
            {fieldErrors.dni &&
              fieldErrors.dni.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Fecha Nacimiento */}
        <div className="mb-4">
          <label htmlFor="fechaNacimiento" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Fecha de Nacimiento
          </label>
          <div className="relative">
            <input
              id="fechaNacimiento"
              name="fechaNacimiento"
              type="date"
              autoComplete="bday"
              defaultValue={values.fechaNacimiento}
              onChange={handleChange}
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Género */}
        <div className="mb-4">
          <label htmlFor="genero" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Género
          </label>
          <div className="relative">
            <select
              id="genero"
              name="genero"
              autoComplete="sex"
              defaultValue={values.genero}
              onChange={handleChange}
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
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
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Ingrese el email"
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              autoComplete="email"
              defaultValue={values.email}
              onChange={handleChange}
              aria-describedby="email-error"
            />
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {fieldErrors.email &&
              fieldErrors.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Telefono */}
        <div className="mb-4">
          <label htmlFor="telefono" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Teléfono
          </label>
          <div className="relative">
            <input
              id="telefono"
              name="telefono"
              type="text"
              placeholder="Ingrese el teléfono"
              autoComplete="tel"
              defaultValue={values.telefono}
              onChange={handleChange}
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Dirección */}
        <div className="mb-4">
          <label htmlFor="direccion" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Dirección
          </label>
          <div className="relative">
            <input
              id="direccion"
              name="direccion"
              type="text"
              placeholder="Ingrese la dirección"
              autoComplete="street-address"
              defaultValue={values.direccion}
              onChange={handleChange}
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-300 dark:border-gray-600" />
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Datos de Emergencia</h3>

        {/* Contacto Emergencia (obligatorio) */}
        <div className="mb-4">
          <label htmlFor="contactoEmergencia" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Nombre Contacto Emergencia <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="contactoEmergencia"
              name="contactoEmergencia"
              type="text"
              placeholder="Nombre de familiar o amigo"
              autoComplete="off"
              defaultValue={values.contactoEmergencia}
              onChange={handleChange}
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              required
            />
          </div>
        </div>

        {/* Teléfono Emergencia */}
        <div className="mb-4">
          <label htmlFor="telefonoEmergencia" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Teléfono Emergencia
          </label>
          <div className="relative">
            <input
              id="telefonoEmergencia"
              name="telefonoEmergencia"
              type="text"
              placeholder="Teléfono de emergencia"
              autoComplete="off"
              defaultValue={values.telefonoEmergencia}
              onChange={handleChange}
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-300 dark:border-gray-600" />
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Salud y Objetivos</h3>

        {/* Condiciones Médicas (obligatorio) */}
        <div className="mb-4">
          <label htmlFor="condicionesMedicas" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Condiciones Médicas / Alergias <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              id="condicionesMedicas"
              name="condicionesMedicas"
              placeholder="Describa condiciones médicas relevantes..."
              defaultValue={values.condicionesMedicas}
              onChange={handleChange}
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Objetivo */}
        <div className="mb-4">
          <label htmlFor="objetivo" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Objetivo Principal
          </label>
          <div className="relative">
            <input
              id="objetivo"
              name="objetivo"
              type="text"
              placeholder="Ej: Bajar de peso, Ganar masa muscular..."
              defaultValue={values.objetivo}
              onChange={handleChange}
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-300 dark:border-gray-600" />

        {/* ...eliminado el checkbox de socio libre... */}

        <div aria-live="polite" aria-atomic="true">
            {error && (
                <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                </p>
            )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/socios"
          className="flex h-10 items-center rounded-lg bg-gray-100 dark:bg-gray-700 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Cancelar
        </Link>
        <button type="submit" aria-disabled={isPending} className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {isPending ? 'Creando...' : 'Crear Socio'}
        </button>
      </div>
    </form>
  );
}
