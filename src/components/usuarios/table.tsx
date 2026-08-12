'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UsuariosDB } from '@/lib/db';

type User = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
};

export default function UsersTable({
  users,
}: {
  users: User[];
}) {
  const router = useRouter();

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      UsuariosDB.delete({ id });
      router.refresh();
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2 md:pt-0">
          <div className="md:hidden">
            {users?.map((user) => (
              <div
                key={user.id}
                className="mb-3 w-full rounded-md bg-white dark:bg-gray-700 p-4"
              >
                <div className="pb-3 border-b dark:border-gray-600">
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {user.nombre}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 break-all">
                    {user.email}
                  </p>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium">
                    {user.rol}
                  </span>
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <Link
                    href={`/admin/usuarios/${user.id}/edit`}
                    className="rounded-md border border-gray-300 dark:border-gray-600 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="rounded-md border border-gray-300 dark:border-gray-600 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 dark:text-gray-100 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6 text-gray-900 dark:text-gray-100">Nombre</th>
                <th scope="col" className="px-3 py-5 font-medium">Email</th>
                <th scope="col" className="px-3 py-5 font-medium">Rol</th>
                <th scope="col" className="relative py-3 pl-6 pr-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700">
              {users?.map((user) => (
                <tr
                  key={user.id}
                  className="w-full border-b border-gray-200 dark:border-gray-600 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{user.nombre}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{user.email}</td>
                  <td className="whitespace-nowrap px-3 py-3">{user.rol}</td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/usuarios/${user.id}/edit`} className="rounded-md border p-2 hover:bg-gray-100">
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="rounded-md border p-2 hover:bg-gray-100 text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
