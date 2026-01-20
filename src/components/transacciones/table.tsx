import { fetchTransacciones } from '@/lib/data-transacciones';
import VerTicketButton from './ver-ticket-button';
import { getConfiguracion } from '@/lib/data';

export default async function TransaccionesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const transacciones = await fetchTransacciones(query, currentPage);
  const config = await getConfiguracion();

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {transacciones?.map((transaccion) => (
              <div
                key={transaccion.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{transaccion.suscripcion.socio.nombre} {transaccion.suscripcion.socio.apellido}</p>
                    </div>
                    <p className="text-sm text-gray-500">{transaccion.suscripcion.plan.nombre}</p>
                  </div>
                  <div className="font-bold text-green-600">
                    ${Number(transaccion.monto).toFixed(2)}
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-sm">Fecha: {transaccion.fecha.toLocaleDateString()}</p>
                    <p className="text-sm">Método: {transaccion.metodoPago}</p>
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
                  Fecha
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Monto
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Método de Pago
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Notas
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {transacciones?.map((transaccion) => (
                <tr
                  key={transaccion.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{transaccion.suscripcion.socio.nombre} {transaccion.suscripcion.socio.apellido}</p>
                    </div>
                    <p className="text-xs text-gray-500">{transaccion.suscripcion.socio.dni}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {transaccion.suscripcion.plan.nombre}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {transaccion.fecha.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-bold text-green-600">
                    ${Number(transaccion.monto).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {transaccion.metodoPago}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">
                    {transaccion.notas || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex justify-center gap-3">
                      <VerTicketButton 
                        ticketData={{
                          id: transaccion.id,
                          socioNombre: `${transaccion.suscripcion.socio.nombre} ${transaccion.suscripcion.socio.apellido}`,
                          planNombre: transaccion.suscripcion.plan.nombre,
                          monto: Number(transaccion.monto),
                          fecha: transaccion.fecha,
                          metodoPago: transaccion.metodoPago,
                          notas: transaccion.notas,
                          telefonoSocio: transaccion.suscripcion.socio.telefono,
                        }}
                        logoUrl={config?.logoUrl || undefined}
                      />
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
