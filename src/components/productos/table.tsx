import { getProductos } from '@/actions/productos-actions';
import Link from 'next/link';
import { PencilIcon } from '@heroicons/react/24/outline';
import DeleteButton from './delete-button';

export default async function ProductosTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const productos = await getProductos(query);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0 dark:bg-gray-900">
          <div className="md:hidden">
            {productos?.map((producto) => (
              <div
                key={producto.id}
                className="mb-2 w-full rounded-md bg-white p-4 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{producto.nombre}</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{producto.descripcion}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${producto.activo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {producto.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium text-gray-900 dark:text-white">
                      ${Number(producto.precio).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stock: {producto.stock}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Link
                        href={`/admin/productos/${producto.id}/edit`}
                        className="rounded-md border p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <PencilIcon className="w-5" />
                    </Link>
                    <DeleteButton id={producto.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table dark:text-gray-100">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Nombre
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Descripción
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Precio
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Stock
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Estado
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {productos?.map((producto) => (
                <tr
                  key={producto.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg dark:border-gray-700"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900 dark:text-white">{producto.nombre}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-500 dark:text-gray-300">
                    {producto.descripcion}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-900 dark:text-white">
                    ${Number(producto.precio).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-900 dark:text-white">
                    {producto.stock}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${producto.activo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/productos/${producto.id}/edit`}
                        className="rounded-md border p-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <PencilIcon className="w-5" />
                      </Link>
                      <DeleteButton id={producto.id} />
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
