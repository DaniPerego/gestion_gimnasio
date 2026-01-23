'use client';

import { useState } from 'react';
import { abrirCuentaCorriente, registrarMovimiento, cerrarCuentaCorriente } from '@/lib/actions-cuenta-corriente';
import { useFormState } from 'react-dom';
import Link from 'next/link';

type CuentaCorriente = {
  id: string;
  saldoDeuda: number;
  saldoCredito: number;
  descripcion: string | null;
  estado: string;
  createdAt: Date;
  movimientos: Array<{
    id: string;
    tipo: string;
    monto: number;
    descripcion: string;
    createdAt: Date;
  }>;
};

type Props = {
  socioId: string;
  cuentaCorriente: CuentaCorriente | null;
};

export default function CuentaCorrienteCard({ socioId, cuentaCorriente }: Props) {
  const [showMovimientoForm, setShowMovimientoForm] = useState(false);
  
  const initialStateAbrir = { message: '', errors: {}, success: false };
  const initialStateMovimiento = { message: '', errors: {}, success: false };
  const initialStateCerrar = { message: '', errors: {}, success: false };
  
  const [stateAbrir, formActionAbrir] = useFormState(abrirCuentaCorriente, initialStateAbrir);
  const [stateMovimiento, formActionMovimiento] = useFormState(registrarMovimiento, initialStateMovimiento);
  const [stateCerrar, formActionCerrar] = useFormState(cerrarCuentaCorriente, initialStateCerrar);

  // Si no tiene cuenta corriente, mostrar botón para abrir
  if (!cuentaCorriente) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Cuenta Corriente</h3>
        <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
          <p className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
            💡 ¿Qué es la Cuenta Corriente?
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Permite llevar un registro de deudas, créditos y pagos pendientes del socio. 
            Útil para adelantos, saldos a favor, o cuotas adeudadas.
          </p>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Este socio no tiene una cuenta corriente activa.
        </p>
        <form action={formActionAbrir}>
          <input type="hidden" name="socioId" value={socioId} />
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            ✓ Abrir Cuenta Corriente
          </button>
        </form>
        {stateAbrir.message && (
          <div className={`mt-3 rounded-lg p-3 ${stateAbrir.success ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
            <p className="text-sm font-medium">{stateAbrir.message}</p>
            {stateAbrir.errors && Object.keys(stateAbrir.errors).length > 0 && (
              <div className="mt-2 text-xs">
                {Object.entries(stateAbrir.errors).map(([key, value]) => (
                  <p key={key}>• {key}: {Array.isArray(value) ? value.join(', ') : value}</p>
                ))}
              </div>
            )}
            {stateAbrir.success && (
              <p className="mt-1 text-xs">Recarga la página para ver la cuenta corriente.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  const saldoNeto = cuentaCorriente.saldoDeuda - cuentaCorriente.saldoCredito;
  const tipoSaldo = saldoNeto > 0 ? 'DEUDA' : saldoNeto < 0 ? 'CRÉDITO' : 'SALDADO';

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cuenta Corriente</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            cuentaCorriente.estado === 'ACTIVO'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : cuentaCorriente.estado === 'SALDADO'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
          }`}
        >
          {cuentaCorriente.estado}
        </span>
      </div>

      {/* Saldo */}
      <div className="mb-4 rounded-lg bg-muted p-4">
        <p className="mb-2 text-sm text-muted-foreground">Saldo Actual</p>
        <div className="flex items-baseline gap-2">
          <p
            className={`text-3xl font-bold ${
              tipoSaldo === 'DEUDA'
                ? 'text-red-600 dark:text-red-400'
                : tipoSaldo === 'CRÉDITO'
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            ${Math.abs(saldoNeto).toFixed(2)}
          </p>
          <span className="text-sm text-muted-foreground">
            {tipoSaldo === 'DEUDA' ? '(Adeuda)' : tipoSaldo === 'CRÉDITO' ? '(A favor)' : '(Sin saldo)'}
          </span>
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Deuda: </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              ${cuentaCorriente.saldoDeuda.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Crédito: </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              ${cuentaCorriente.saldoCredito.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Botón de gestión completa */}
      <Link
        href={`/admin/socios/${socioId}/cuenta-corriente`}
        className="mb-4 block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        📊 Ver Gestión Completa
      </Link>

      {/* Últimos movimientos (resumen) */}
      {cuentaCorriente.movimientos && cuentaCorriente.movimientos.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium">Últimos Movimientos</h4>
          <div className="space-y-2">
            {cuentaCorriente.movimientos.slice(0, 3).map((mov) => (
              <div
                key={mov.id}
                className="flex items-center justify-between rounded border bg-background p-2 text-xs"
              >
                <div className="flex-1">
                  <span
                    className={`mr-2 rounded px-1.5 py-0.5 text-xs font-medium ${
                      mov.tipo === 'DEUDA'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        : mov.tipo === 'CREDITO'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : mov.tipo === 'PAGO'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {mov.tipo}
                  </span>
                  <span className="text-muted-foreground">{new Date(mov.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="font-medium">${mov.monto.toFixed(2)}</p>
              </div>
            ))}
          </div>
          {cuentaCorriente.movimientos.length > 3 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              +{cuentaCorriente.movimientos.length - 3} movimientos más
            </p>
          )}
        </div>
      )}
    </div>
  );
}
