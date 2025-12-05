import { getResumenCaja } from '@/actions/ventas-actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function Page() {
  const { transacciones, resumen } = await getResumenCaja();

  return (
    <main className="p-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Cierre de Caja - {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
      </h1>

      {/* Resumen Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Ingresos</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            ${resumen.total.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Efectivo</h3>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            ${resumen.efectivo.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tarjeta</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            ${resumen.tarjeta.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transferencia</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
            ${resumen.transferencia.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
         <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cantidad Ventas</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{resumen.cantidadVentas}</p>
         </div>
         <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cantidad Cuotas</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{resumen.cantidadCuotas}</p>
         </div>
      </div>

      {/* Tabla de Transacciones */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="border-b px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Transacciones del Día</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Hora</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Descripción</th>
                <th className="px-6 py-3">Socio</th>
                <th className="px-6 py-3">Método</th>
                <th className="px-6 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No hay transacciones hoy.
                  </td>
                </tr>
              ) : (
                transacciones.map((t) => (
                  <tr key={t.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      {format(new Date(t.fecha), 'HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${
                        t.tipo === 'VENTA' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        t.tipo === 'CUOTA' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {t.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">{t.notas || '-'}</td>
                    <td className="px-6 py-4">
                      {t.socio ? `${t.socio.nombre} ${t.socio.apellido}` : '-'}
                    </td>
                    <td className="px-6 py-4">{t.metodoPago}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                      ${Number(t.monto).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
