import { fetchSuscripciones } from '@/lib/data-suscripciones';
import { cancelSuscripcion } from '@/lib/actions-suscripciones';

export default async function SuscripcionesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const suscripciones = await fetchSuscripciones(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {suscripciones?.map((suscripcion) => (
              <div
                key={suscripcion.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{suscripcion.socio.nombre} {suscripcion.socio.apellido}</p>
                    </div>
                    <p className="text-sm text-gray-500">{suscripcion.plan.nombre}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${suscripcion.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {suscripcion.activa ? 'Activa' : 'Inactiva'}
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-sm">Inicio: {suscripcion.fechaInicio.toLocaleDateString()}</p>
                    <p className="text-sm">Fin: {suscripcion.fechaFin.toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    {suscripcion.activa && (
                        <form action={cancelSuscripcion.bind(null, suscripcion.id)}>
                            <button className="rounded-md border p-2 hover:bg-gray-100 text-red-600" title="Cancelar Suscripción">
                                🚫
                            </button>
                        </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Socio
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Plan
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha Inicio
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha Fin
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
              {suscripciones?.map((suscripcion) => (
                <tr
                  key={suscripcion.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{suscripcion.socio.nombre} {suscripcion.socio.apellido}</p>
                    </div>
                    <p className="text-xs text-gray-500">{suscripcion.socio.dni}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {suscripcion.plan.nombre}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {suscripcion.fechaInicio.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {suscripcion.fechaFin.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className={`inline-flex px-2 py-1 text-xs rounded-full ${suscripcion.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {suscripcion.activa ? 'Activa' : 'Inactiva'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                        {suscripcion.activa && (
                            <form action={cancelSuscripcion.bind(null, suscripcion.id)}>
                                <button className="rounded-md border p-2 hover:bg-gray-100 text-red-600" title="Cancelar Suscripción">
                                    🚫
                                </button>
                            </form>
                        )}
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
