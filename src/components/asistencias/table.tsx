import { fetchAsistencias } from '@/lib/data-asistencias';
import { Asistencia, Socio } from '@prisma/client';

type AsistenciaConSocio = Asistencia & {
  socio: Socio;
};

export default async function AsistenciasTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const asistencias = await fetchAsistencias(query, currentPage) as AsistenciaConSocio[];

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {asistencias?.map((asistencia) => (
              <div
                key={asistencia.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{asistencia.socio.nombre} {asistencia.socio.apellido}</p>
                    </div>
                    <p className="text-sm text-gray-500">{asistencia.socio.dni}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(asistencia.fecha).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <p className="text-sm font-medium">
                    {new Date(asistencia.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
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
                  DNI
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Hora
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {asistencias?.map((asistencia) => (
                <tr
                  key={asistencia.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{asistencia.socio.nombre} {asistencia.socio.apellido}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {asistencia.socio.dni}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(asistencia.fecha).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(asistencia.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
