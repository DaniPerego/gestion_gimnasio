import { fetchIngresosPorMes, fetchNuevosSociosPorMes, fetchAsistenciasPorDia, fetchIngresosPorTipo, fetchSociosParaHistorialPagos, fetchHistorialPagosPorSocio } from '@/lib/data-reportes';
import { IngresosPorDia } from '@/components/reportes/ingresos-por-dia';
import { formatFechaBuenosAires } from '@/lib/date-utils';
import SocioHistorialSearchSelect from '@/components/reportes/socio-historial-search-select';
import StatusFilter from '@/components/ui/status-filter';
import HistorialPagosActions from '@/components/reportes/historial-pagos-actions';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    socioId?: string;
    estadoSuscripcion?: string;
  }>;
}) {
  const params = await searchParams;
  const socioId = params?.socioId || '';
  const estadoSuscripcion = params?.estadoSuscripcion || '';

  const ingresos = await fetchIngresosPorMes();
  const nuevosSocios = await fetchNuevosSociosPorMes();
  const asistenciasPorDia = await fetchAsistenciasPorDia();
  const ingresosPorTipo = await fetchIngresosPorTipo();
  const sociosPagos = await fetchSociosParaHistorialPagos();
  const historialPagos = socioId ? await fetchHistorialPagosPorSocio(socioId, estadoSuscripcion || undefined) : null;

  const historialExportable = historialPagos
    ? {
        socioNombre: `${historialPagos.socio.apellido}, ${historialPagos.socio.nombre}`,
        socioDni: historialPagos.socio.dni,
        rows: historialPagos.historial.map((item) => ({
          fecha: formatFechaBuenosAires(item.fecha),
          fechaVencimiento: formatFechaBuenosAires(item.suscripcionFechaFin),
          planNombre: item.planNombre,
          suscripcionEstado: item.suscripcionEstado,
          tipoPago: item.tipoPago,
          metodoPago: item.metodoPago,
          monto: item.monto,
          notas: item.notas,
        })),
      }
    : null;

  return (
    <main className="w-full">
      <div className="print:hidden">
        <h1 className="mb-8 text-2xl font-bold text-gray-800 dark:text-white">Reportes y Estadísticas</h1>

        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Historial de pagos por socio</h2>
              <p className="mt-1 text-sm text-gray-500">
                Seleccioná un socio para ver todas sus transacciones, incluso si la suscripción ya fue suspendida o vencida.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <SocioHistorialSearchSelect socios={sociosPagos} />
              <StatusFilter
                filterKey="estadoSuscripcion"
                placeholder="Estado"
                options={[
                  { value: 'Activa', label: 'Activa' },
                  { value: 'Vencida', label: 'Vencida' },
                  { value: 'Suspendida', label: 'Suspendida' },
                ]}
              />
            </div>
          </div>

          {historialPagos ? (
            <div className="mt-6 space-y-4">
              {historialExportable && (
                <div className="flex justify-end">
                  <HistorialPagosActions
                    socioNombre={historialExportable.socioNombre}
                    socioDni={historialExportable.socioDni}
                    rows={historialExportable.rows}
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-700">Socio</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {historialPagos.socio.apellido}, {historialPagos.socio.nombre}
                  </p>
                  <p className="text-sm text-blue-700">DNI: {historialPagos.socio.dni}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-700">Pagos registrados</p>
                  <p className="text-2xl font-bold text-emerald-900">{historialPagos.cantidadPagos}</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-4">
                  <p className="text-sm font-medium text-orange-700">Total pagado</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                    }).format(historialPagos.totalPagado)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {historialPagos.resumenPorEstado.map((item) => (
                  <div
                    key={item.estado}
                    className={`rounded-lg p-4 ${
                      item.estado === 'Activa'
                        ? 'bg-green-50'
                        : item.estado === 'Vencida'
                        ? 'bg-red-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        item.estado === 'Activa'
                          ? 'text-green-700'
                          : item.estado === 'Vencida'
                          ? 'text-red-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {item.estado}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{item.cantidad} pagos</p>
                    <p className="text-sm text-gray-700">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      }).format(item.total)}
                    </p>
                  </div>
                ))}
              </div>

              {historialPagos.historial.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                  Este socio no tiene pagos registrados.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Vencimiento</th>
                        <th className="px-4 py-3">Plan</th>
                        <th className="px-4 py-3">Estado suscripción</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Método</th>
                        <th className="px-4 py-3 text-right">Monto</th>
                        <th className="px-4 py-3">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialPagos.historial.map((item) => (
                        <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700">{formatFechaBuenosAires(item.fecha)}</td>
                          <td className="px-4 py-3 text-gray-700">{formatFechaBuenosAires(item.suscripcionFechaFin)}</td>
                          <td className="px-4 py-3 text-gray-700">{item.planNombre}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                item.suscripcionEstado === 'Activa'
                                  ? 'bg-green-100 text-green-800'
                                  : item.suscripcionEstado === 'Vencida'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.suscripcionEstado}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{item.tipoPago}</td>
                          <td className="px-4 py-3 text-gray-700">{item.metodoPago}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {new Intl.NumberFormat('es-AR', {
                              style: 'currency',
                              currency: 'ARS',
                            }).format(item.monto)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{item.notas || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              Elegí un socio para ver su historial de pagos.
            </div>
          )}
        </div>

        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Ingresos (Últimos 30 días)</h2>
            <div className="space-y-4">
              {ingresosPorTipo.length === 0 ? (
                <p className="text-center text-gray-500">No hay datos disponibles</p>
              ) : (
                ingresosPorTipo.map((item) => (
                  <div key={item.tipo} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${item.tipo === 'Mensualidades' ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <span className="text-gray-600">{item.tipo}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      }).format(item.monto)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Asistencias por Día (Últimos 30 días)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b font-medium text-gray-900">
                  <tr>
                    <th className="px-4 py-2">Día</th>
                    <th className="px-4 py-2 text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {asistenciasPorDia.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-4 text-center text-gray-500">
                        No hay datos disponibles
                      </td>
                    </tr>
                  ) : (
                    asistenciasPorDia.map((item) => (
                      <tr key={item.dia} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{item.dia}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{item.cantidad}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Ingresos Mensuales (Último Año)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b font-medium text-gray-900">
                  <tr>
                    <th className="px-4 py-2">Mes</th>
                    <th className="px-4 py-2 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresos.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-4 text-center text-gray-500">
                        No hay datos disponibles
                      </td>
                    </tr>
                  ) : (
                    ingresos.map((item) => (
                      <tr key={item.fecha} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{item.fecha}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {new Intl.NumberFormat('es-AR', {
                            style: 'currency',
                            currency: 'ARS',
                          }).format(item.monto)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Nuevos Socios (Último Año)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b font-medium text-gray-900">
                  <tr>
                    <th className="px-4 py-2">Mes</th>
                    <th className="px-4 py-2 text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {nuevosSocios.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-4 text-center text-gray-500">
                        No hay datos disponibles
                      </td>
                    </tr>
                  ) : (
                    nuevosSocios.map((item) => (
                      <tr key={item.fecha} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{item.fecha}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{item.cantidad}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          <IngresosPorDia />
        </div>
      </div>

      <div className="hidden p-8 text-gray-900 print:block">
        <div className="mb-6 border-b border-gray-300 pb-4">
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">Bendito</p>
          <h1 className="text-2xl font-bold">Historial de pagos por socio</h1>
          <p className="text-sm text-gray-600">Reporte resumido de pagos, vencimientos y estado de suscripciones.</p>
        </div>

        {historialPagos ? (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded border border-gray-300 p-3">
                <p className="text-xs uppercase text-gray-500">Socio</p>
                <p className="font-semibold">
                  {historialPagos.socio.apellido}, {historialPagos.socio.nombre}
                </p>
                <p className="text-gray-600">DNI: {historialPagos.socio.dni}</p>
              </div>
              <div className="rounded border border-gray-300 p-3">
                <p className="text-xs uppercase text-gray-500">Pagos</p>
                <p className="text-2xl font-bold">{historialPagos.cantidadPagos}</p>
              </div>
              <div className="rounded border border-gray-300 p-3">
                <p className="text-xs uppercase text-gray-500">Total pagado</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(historialPagos.totalPagado)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {historialPagos.resumenPorEstado.map((item) => (
                <div key={item.estado} className="rounded border border-gray-300 p-3">
                  <p className="text-xs uppercase text-gray-500">{item.estado}</p>
                  <p className="font-semibold">{item.cantidad} pagos</p>
                  <p className="text-gray-600">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.total)}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-300 text-xs uppercase text-gray-500">
                    <th className="py-2 pr-3">Pago</th>
                    <th className="py-2 pr-3">Vence</th>
                    <th className="py-2 pr-3">Plan</th>
                    <th className="py-2 pr-3">Estado</th>
                    <th className="py-2 pr-3">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {historialPagos.historial.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 align-top">
                      <td className="py-2 pr-3">{formatFechaBuenosAires(item.fecha)}</td>
                      <td className="py-2 pr-3">{formatFechaBuenosAires(item.suscripcionFechaFin)}</td>
                      <td className="py-2 pr-3">{item.planNombre}</td>
                      <td className="py-2 pr-3">{item.suscripcionEstado}</td>
                      <td className="py-2 pr-3 font-semibold">
                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No hay un socio seleccionado para imprimir.</p>
        )}
      </div>
    </main>
  );
}