import Link from 'next/link';
import { fetchUsuarios } from '@/lib/data-usuarios';
import { deleteUsuario } from '@/lib/actions-usuarios';

export default async function UsuariosTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const usuarios = await fetchUsuarios(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {usuarios?.map((usuario) => (
              <div
                key={usuario.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p className="font-bold">{usuario.nombre}</p>
                    </div>
                    <p className="text-sm text-gray-500">{usuario.email}</p>
                  </div>
                  <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {usuario.rol}
                  </div>
                </div>
                <div className="flex w-full items-center justify-end pt-4 gap-2">
                    <Link href={`/admin/usuarios/${usuario.id}/edit`} className="rounded-md border p-2 hover:bg-gray-100">
                        ✏️
                    </Link>
                    <form action={deleteUsuario.bind(null, usuario.id)}>
                        <button className="rounded-md border p-2 hover:bg-gray-100 text-red-600">
                            🗑️
                        </button>
                    </form>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Nombre
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Rol
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {usuarios?.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{usuario.nombre}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {usuario.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {usuario.rol}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/usuarios/${usuario.id}/edit`} className="rounded-md border p-2 hover:bg-gray-100">
                        ✏️
                      </Link>
                      <form action={deleteUsuario.bind(null, usuario.id)}>
                        <button className="rounded-md border p-2 hover:bg-gray-100 text-red-600">
                            🗑️
                        </button>
                      </form>
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
