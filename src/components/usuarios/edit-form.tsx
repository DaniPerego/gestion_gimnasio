'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UsuariosDB, Usuario } from '@/lib/db';

export default function EditForm({ usuario }: { usuario: Usuario }) {
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
    const rol = formData.get('rol') as string;
    const password = formData.get('password') as string;

    const errors: Record<string, string[]> = {};
    if (!nombre?.trim()) errors.nombre = ['El nombre es obligatorio'];
    if (!email?.trim()) errors.email = ['El email es obligatorio'];
    if (!rol) errors.rol = ['El rol es obligatorio'];
    if (password && password.length < 6) errors.password = ['La contraseña debe tener al menos 6 caracteres'];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsPending(false);
      return;
    }

    const dataToUpdate: any = {
      nombre: nombre.trim(),
      email: email.trim(),
      rol,
      permisoSocios: formData.get('permisoSocios') === 'on',
      permisoPlanes: formData.get('permisoPlanes') === 'on',
      permisoSuscripciones: formData.get('permisoSuscripciones') === 'on',
      permisoAsistencias: formData.get('permisoAsistencias') === 'on',
      permisoReportes: formData.get('permisoReportes') === 'on',
      permisoConfiguracion: formData.get('permisoConfiguracion') === 'on',
      permisoUsuarios: formData.get('permisoUsuarios') === 'on',
      permisoTransacciones: formData.get('permisoTransacciones') === 'on',
    };

    if (password) {
      dataToUpdate.password = password;
    }

    try {
      UsuariosDB.update({ id: usuario.id }, dataToUpdate);
      router.push('/admin/usuarios');
    } catch {
      setError('Error al actualizar el usuario. Intente nuevamente.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
        )}

        <div className="mb-4">
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-gray-900">Nombre</label>
          <input id="nombre" name="nombre" type="text" defaultValue={usuario.nombre || ''} placeholder="Ingrese el nombre"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
          {fieldErrors.nombre && fieldErrors.nombre.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">Email</label>
          <input id="email" name="email" type="email" defaultValue={usuario.email || ''} placeholder="Ingrese el email"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
          {fieldErrors.email && fieldErrors.email.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900">
            Contraseña (dejar vacío para no cambiar)
          </label>
          <input id="password" name="password" type="password" placeholder="Nueva contraseña"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500" />
          {fieldErrors.password && fieldErrors.password.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="rol" className="mb-2 block text-sm font-medium text-gray-900">Rol</label>
          <select id="rol" name="rol" defaultValue={usuario.rol}
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500">
            <option value="ADMIN">Administrador</option>
            <option value="RECEPCIONISTA">Recepcionista</option>
            <option value="PROFESOR">Profesor</option>
          </select>
          {fieldErrors.rol && fieldErrors.rol.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium text-gray-900">Permisos de Acceso</span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {([
              ['permisoSocios', 'Gestión de Socios', usuario.permisoSocios],
              ['permisoPlanes', 'Gestión de Planes', usuario.permisoPlanes],
              ['permisoSuscripciones', 'Gestión de Suscripciones', usuario.permisoSuscripciones],
              ['permisoAsistencias', 'Control de Asistencias', usuario.permisoAsistencias],
              ['permisoTransacciones', 'Caja y Transacciones', usuario.permisoTransacciones],
              ['permisoReportes', 'Ver Reportes', usuario.permisoReportes],
              ['permisoConfiguracion', 'Configuración del Sistema', usuario.permisoConfiguracion],
              ['permisoUsuarios', 'Gestión de Usuarios', usuario.permisoUsuarios],
            ] as [string, string, boolean][]).map(([name, label, defaultChecked]) => (
              <div key={name} className="flex items-center">
                <input id={name} name={name} type="checkbox" defaultChecked={defaultChecked}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor={name} className="ml-2 block text-sm text-gray-900">{label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/usuarios"
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
