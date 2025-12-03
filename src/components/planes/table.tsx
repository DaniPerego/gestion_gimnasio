import Link from 'next/link';
import { fetchPlanes } from '@/lib/data-planes';
import { deletePlan } from '@/lib/actions-planes';

export default async function PlanesTable() {
  const planes = await fetchPlanes();

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {planes?.map((plan) => (
              <div
                key={plan.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p className="font-bold">{plan.nombre}</p>
                    </div>
                    <p className="text-sm text-gray-500">{plan.descripcion}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${plan.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {plan.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">$ {Number(plan.precio).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{plan.duracionMeses} meses</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/planes/${plan.id}/edit`} className="rounded-md border p-2 hover:bg-gray-100">
                        ✏️
                    </Link>
                    <form action={deletePlan.bind(null, plan.id)}>
                        <button className="rounded-md border p-2 hover:bg-gray-100 text-red-600">
                            🗑️
                        </button>
                    </form>
                  </div>
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
                  Descripción
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Precio
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Duración
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Estado
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {planes?.map((plan) => (
                <tr
                  key={plan.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{plan.nombre}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {plan.descripcion}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    $ {Number(plan.precio).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {plan.duracionMeses} meses
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${plan.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {plan.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                        <Link href={`/admin/planes/${plan.id}/edit`} className="rounded-md border p-2 hover:bg-gray-100">
                            ✏️
                        </Link>
                        <form action={deletePlan.bind(null, plan.id)}>
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
