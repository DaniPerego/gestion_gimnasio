'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SociosDB, Socio } from '@/lib/db';

export default function EditForm({ socio }: { socio: Socio }) {
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
    const apellido = formData.get('apellido') as string;
    const dni = formData.get('dni') as string;

    const errors: Record<string, string[]> = {};
    if (!nombre?.trim()) errors.nombre = ['El nombre es obligatorio'];
    if (!apellido?.trim()) errors.apellido = ['El apellido es obligatorio'];
    if (!dni?.trim()) errors.dni = ['El DNI es obligatorio'];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsPending(false);
      return;
    }

    try {
      SociosDB.update({ id: socio.id }, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim(),
        email: (formData.get('email') as string)?.trim() || null,
        telefono: (formData.get('telefono') as string)?.trim() || null,
        fechaNacimiento: formData.get('fechaNacimiento') ? new Date(formData.get('fechaNacimiento') as string) : null,
        genero: (formData.get('genero') as string) || null,
        direccion: (formData.get('direccion') as string)?.trim() || null,
        fotoUrl: null,
        contactoEmergencia: (formData.get('contactoEmergencia') as string)?.trim() || null,
        telefonoEmergencia: (formData.get('telefonoEmergencia') as string)?.trim() || null,
        condicionesMedicas: (formData.get('condicionesMedicas') as string)?.trim() || null,
        objetivo: (formData.get('objetivo') as string)?.trim() || null,
        esLibre: formData.get('esLibre') === 'on',
      });
      router.push('/admin/socios');
    } catch {
      setError('Error al actualizar el socio. Intente nuevamente.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-gray-900">Nombre</label>
          <input id="nombre" name="nombre" type="text" defaultValue={socio.nombre} placeholder="Ingrese el nombre"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
          {fieldErrors.nombre && fieldErrors.nombre.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="apellido" className="mb-2 block text-sm font-medium text-gray-900">Apellido</label>
          <input id="apellido" name="apellido" type="text" defaultValue={socio.apellido} placeholder="Ingrese el apellido"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
          {fieldErrors.apellido && fieldErrors.apellido.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="dni" className="mb-2 block text-sm font-medium text-gray-900">DNI</label>
          <input id="dni" name="dni" type="text" defaultValue={socio.dni} placeholder="Ingrese el DNI"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
          {fieldErrors.dni && fieldErrors.dni.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="fechaNacimiento" className="mb-2 block text-sm font-medium text-gray-900">Fecha de Nacimiento</label>
          <input id="fechaNacimiento" name="fechaNacimiento" type="date"
            defaultValue={socio.fechaNacimiento ? new Date(socio.fechaNacimiento).toISOString().split('T')[0] : ''}
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
        </div>

        <div className="mb-4">
          <label htmlFor="genero" className="mb-2 block text-sm font-medium text-gray-900">Género</label>
          <select id="genero" name="genero" defaultValue={socio.genero || ''}
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500">
            <option value="">Seleccione...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">Email</label>
          <input id="email" name="email" type="email" defaultValue={socio.email || ''} placeholder="Ingrese el email"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
        </div>

        <div className="mb-4">
          <label htmlFor="telefono" className="mb-2 block text-sm font-medium text-gray-900">Teléfono</label>
          <input id="telefono" name="telefono" type="text" defaultValue={socio.telefono || ''} placeholder="Ingrese el teléfono"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
        </div>

        <div className="mb-4">
          <label htmlFor="direccion" className="mb-2 block text-sm font-medium text-gray-900">Dirección</label>
          <input id="direccion" name="direccion" type="text" defaultValue={socio.direccion || ''} placeholder="Ingrese la dirección"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
        </div>

        <hr className="my-6 border-gray-200" />
        <h3 className="mb-4 text-lg font-medium text-gray-900">Datos de Emergencia</h3>

        <div className="mb-4">
          <label htmlFor="contactoEmergencia" className="mb-2 block text-sm font-medium text-gray-900">Nombre Contacto Emergencia</label>
          <input id="contactoEmergencia" name="contactoEmergencia" type="text" defaultValue={socio.contactoEmergencia || ''} placeholder="Nombre de familiar o amigo"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
        </div>

        <div className="mb-4">
          <label htmlFor="telefonoEmergencia" className="mb-2 block text-sm font-medium text-gray-900">Teléfono Emergencia</label>
          <input id="telefonoEmergencia" name="telefonoEmergencia" type="text" defaultValue={socio.telefonoEmergencia || ''} placeholder="Teléfono de emergencia"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
        </div>

        <hr className="my-6 border-gray-200" />
        <h3 className="mb-4 text-lg font-medium text-gray-900">Salud y Objetivos</h3>

        <div className="mb-4">
          <label htmlFor="condicionesMedicas" className="mb-2 block text-sm font-medium text-gray-900">Condiciones Médicas / Alergias</label>
          <textarea id="condicionesMedicas" name="condicionesMedicas" defaultValue={socio.condicionesMedicas || ''} placeholder="Describa condiciones médicas relevantes..."
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" rows={3} />
        </div>

        <div className="mb-4">
          <label htmlFor="objetivo" className="mb-2 block text-sm font-medium text-gray-900">Objetivo Principal</label>
          <input id="objetivo" name="objetivo" type="text" defaultValue={socio.objetivo || ''} placeholder="Ej: Bajar de peso, Ganar masa muscular..."
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
        </div>

        <hr className="my-6 border-gray-200" />

        <div className="mb-4">
          <div className="flex items-center">
            <input id="esLibre" name="esLibre" type="checkbox" defaultChecked={socio.esLibre}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="esLibre" className="ml-2 block text-sm font-medium text-gray-900">
              Socio Libre (Acceso gratuito/ilimitado)
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Si se marca, el socio tendrá acceso permitido siempre, sin necesidad de suscripción.
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/socios"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button type="submit" disabled={isPending} className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50">
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
