import { fetchSociosConCuentaCorriente } from '@/lib/data-cuenta-corriente';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function Page() {
  const socios = await fetchSociosConCuentaCorriente();

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cuenta Corriente</h1>
      </div>

      <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 <strong>Gestiona deudas y créditos</strong> de los socios. Puedes abrir cuentas corrientes, 
          registrar movimientos y aplicar pagos automáticamente desde las transacciones.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {socios.map((socio) => {
          const tieneCuenta = socio.cuentaCorriente !== null;
          const saldoNeto = tieneCuenta 
            ? socio.cuentaCorriente!.saldoDeuda - socio.cuentaCorriente!.saldoCredito 
            : 0;
          const tipoSaldo = saldoNeto > 0 ? 'DEUDA' : saldoNeto < 0 ? 'CRÉDITO' : 'SALDADO';

          return (
            <Link
              key={socio.id}
              href={`/admin/cuenta-corriente/${socio.id}`}
              className="block rounded-lg border bg-card p-6 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">
                    {socio.nombre} {socio.apellido}
                  </h3>
                  <p className="text-sm text-muted-foreground">DNI: {socio.dni}</p>
                </div>
                {tieneCuenta && (
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      socio.cuentaCorriente!.estado === 'ACTIVO'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {socio.cuentaCorriente!.estado}
                  </span>
                )}
              </div>

              {tieneCuenta ? (
                <div className="rounded-lg bg-muted p-3">
                  <p className="mb-1 text-xs text-muted-foreground">Saldo</p>
                  <p
                    className={`text-2xl font-bold ${
                      tipoSaldo === 'DEUDA'
                        ? 'text-red-600 dark:text-red-400'
                        : tipoSaldo === 'CRÉDITO'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    ${Math.abs(saldoNeto).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tipoSaldo === 'DEUDA' ? 'Adeuda' : tipoSaldo === 'CRÉDITO' ? 'A favor' : 'Sin saldo'}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed p-3 text-center">
                  <p className="text-sm text-muted-foreground">Sin cuenta corriente</p>
                  <p className="mt-1 text-xs text-muted-foreground">Haz clic para abrir</p>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {socios.length === 0 && (
        <div className="rounded-lg border-2 border-dashed p-12 text-center">
          <p className="text-muted-foreground">No hay socios registrados.</p>
        </div>
      )}
    </main>
  );
}
