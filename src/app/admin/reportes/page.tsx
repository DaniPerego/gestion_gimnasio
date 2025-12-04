import { fetchIngresosPorMes, fetchNuevosSociosPorMes } from '@/lib/data-reportes';

export default async function Page() {
  const ingresos = await fetchIngresosPorMes();
  const nuevosSocios = await fetchNuevosSociosPorMes();

  return (
    <main className="w-full">
      <h1 className="mb-8 text-2xl font-bold text-gray-800 dark:text-white">Reportes y Estadísticas</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Reporte de Ingresos */}
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

        {/* Reporte de Nuevos Socios */}
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
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {item.cantidad}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
