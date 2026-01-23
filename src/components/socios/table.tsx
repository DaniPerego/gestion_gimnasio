import Link from 'next/link';
import { fetchFilteredSocios } from '@/lib/data-socios';
import { deleteSocio } from '@/lib/actions-socios';
import WhatsAppButton from './whatsapp-button';

export default async function SociosTable({
  query,
  currentPage,
  estado,
}: {
  query: string;
  currentPage: number;
  estado?: string;
}) {
  const socios = await fetchFilteredSocios(query, currentPage, estado);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {socios?.map((socio) => (
              <div
                key={socio.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{socio.nombre} {socio.apellido}</p>
                    </div>
                    <p className="text-sm text-gray-500">{socio.email}</p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${socio.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {socio.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">{socio.dni}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <WhatsAppButton telefono={socio.telefono} nombre={socio.nombre} />
                    <Link href={`/admin/socios/${socio.id}/edit`} className="rounded-md border p-2 hover:bg-gray-100">
                        ✏️
                    </Link>
                    <form action={deleteSocio.bind(null, socio.id)}>
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
                  DNI
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
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
              {socios?.map((socio) => (
                <tr
                  key={socio.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{socio.nombre} {socio.apellido}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {socio.dni}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {socio.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${socio.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {socio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                        <WhatsAppButton telefono={socio.telefono} nombre={socio.nombre} />
                        <Link href={`/admin/socios/${socio.id}/edit`} className="rounded-md border p-2 hover:bg-gray-100">
                            ✏️
                        </Link>
                        <form action={deleteSocio.bind(null, socio.id)}>
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
