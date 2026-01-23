'use client';

import { useState } from 'react';
import { abrirCuentaCorriente, registrarMovimiento, cerrarCuentaCorriente } from '@/lib/actions-cuenta-corriente';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';

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
  socioNombre: string;
  cuentaCorriente: CuentaCorriente | null;
};

export default function CuentaCorrienteManager({ socioId, socioNombre, cuentaCorriente }: Props) {
  const router = useRouter();
  const [showMovimientoForm, setShowMovimientoForm] = useState(false);
  
  const initialStateAbrir = { message: '', errors: {}, success: false };
  const initialStateMovimiento = { message: '', errors: {}, success: false };
  const initialStateCerrar = { message: '', errors: {}, success: false };
  
  const [stateAbrir, formActionAbrir] = useFormState(abrirCuentaCorriente, initialStateAbrir);
  const [stateMovimiento, formActionMovimiento] = useFormState(registrarMovimiento, initialStateMovimiento);
  const [stateCerrar, formActionCerrar] = useFormState(cerrarCuentaCorriente, initialStateCerrar);

  // Refrescar después de abrir cuenta
  if (stateAbrir.success && !cuentaCorriente) {
    setTimeout(() => router.refresh(), 1000);
  }

  // Refrescar después de movimiento
  if (stateMovimiento.success) {
    setTimeout(() => {
      router.refresh();
      setShowMovimientoForm(false);
    }, 1000);
  }

  // Si no tiene cuenta corriente
  if (!cuentaCorriente) {
    return (
      <div className="max-w-2xl">
        <div className="rounded-lg border-2 border-dashed bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-3xl">💳</span>
          </div>
          <h3 className="mb-2 text-xl font-semibold">Sin Cuenta Corriente</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            {socioNombre} no tiene una cuenta corriente activa. Abre una para comenzar a registrar deudas, créditos y pagos.
          </p>
          
          <div className="mb-6 rounded-lg bg-muted p-4 text-left">
            <p className="mb-2 text-sm font-medium">💡 ¿Para qué sirve?</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Registrar cuotas adeudadas</li>
              <li>• Guardar saldos a favor (pagos adelantados)</li>
              <li>• Aplicar descuentos pendientes</li>
              <li>• Historial completo de movimientos</li>
            </ul>
          </div>

          <form action={formActionAbrir} className="inline-block">
            <input type="hidden" name="socioId" value={socioId} />
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              ✓ Abrir Cuenta Corriente
            </button>
          </form>

          {stateAbrir.message && (
            <div className={`mt-4 rounded-lg p-4 ${stateAbrir.success ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
              <p className="font-medium">{stateAbrir.message}</p>
              {stateAbrir.success && (
                <p className="mt-1 text-sm">Actualizando...</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const saldoNeto = cuentaCorriente.saldoDeuda - cuentaCorriente.saldoCredito;
  const tipoSaldo = saldoNeto > 0 ? 'DEUDA' : saldoNeto < 0 ? 'CRÉDITO' : 'SALDADO';

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Columna izquierda - Resumen */}
      <div className="lg:col-span-2 space-y-6">
        {/* Card de Saldo */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Saldo Actual</h3>
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

          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-6">
            <p className="mb-2 text-sm text-muted-foreground">Saldo Neto</p>
            <div className="flex items-baseline gap-3">
              <p
                className={`text-4xl font-bold ${
                  tipoSaldo === 'DEUDA'
                    ? 'text-red-600 dark:text-red-400'
                    : tipoSaldo === 'CRÉDITO'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                ${Math.abs(saldoNeto).toFixed(2)}
              </p>
              <span className="text-lg font-medium text-muted-foreground">
                {tipoSaldo === 'DEUDA' ? 'Adeuda' : tipoSaldo === 'CRÉDITO' ? 'A favor' : 'Sin saldo'}
              </span>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-background/50 p-3">
                <p className="text-xs text-muted-foreground">Total Deuda</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  ${cuentaCorriente.saldoDeuda.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-background/50 p-3">
                <p className="text-xs text-muted-foreground">Total Crédito</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ${cuentaCorriente.saldoCredito.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Movimientos */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Historial de Movimientos</h3>
          
          {cuentaCorriente.movimientos && cuentaCorriente.movimientos.length > 0 ? (
            <div className="space-y-3">
              {cuentaCorriente.movimientos.map((mov) => (
                <div
                  key={mov.id}
                  className="flex items-start gap-4 rounded-lg border bg-background p-4"
                >
                  <div
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
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
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{mov.descripcion}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(mov.createdAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <p className="text-lg font-bold">${mov.monto.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              No hay movimientos registrados aún.
            </p>
          )}
        </div>
      </div>

      {/* Columna derecha - Acciones */}
      <div className="space-y-6">
        {/* Registrar Movimiento */}
        {cuentaCorriente.estado === 'ACTIVO' && (
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Registrar Movimiento</h3>
            
            <form action={formActionMovimiento} className="space-y-4">
              <input type="hidden" name="cuentaCorrienteId" value={cuentaCorriente.id} />
              
              <div>
                <label htmlFor="tipo" className="mb-1 block text-sm font-medium">
                  Tipo
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="DEUDA">➕ Registrar Deuda</option>
                  <option value="CREDITO">➖ Registrar Crédito</option>
                  <option value="AJUSTE">🔧 Ajuste Manual</option>
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Deuda: suma a lo que debe. Crédito: suma saldo a favor
                </p>
              </div>

              <div>
                <label htmlFor="monto" className="mb-1 block text-sm font-medium">
                  Monto
                </label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  step="0.01"
                  min="0.01"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="descripcion" className="mb-1 block text-sm font-medium">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Ej: Cuota de enero adeudada"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Registrar
              </button>

              {stateMovimiento.message && (
                <div className={`rounded-lg p-3 text-sm ${stateMovimiento.success ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                  {stateMovimiento.message}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Cerrar Cuenta */}
        {saldoNeto === 0 && cuentaCorriente.estado === 'SALDADO' && (
          <div className="rounded-lg border border-destructive/50 bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold">Cerrar Cuenta</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              La cuenta está saldada. Puedes cerrarla permanentemente.
            </p>
            <form action={formActionCerrar}>
              <input type="hidden" name="cuentaCorrienteId" value={cuentaCorriente.id} />
              <button
                type="submit"
                className="w-full rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Cerrar Cuenta
              </button>
            </form>
            {stateCerrar.message && (
              <p className={`mt-2 text-sm ${stateCerrar.success ? 'text-green-600' : 'text-red-600'}`}>
                {stateCerrar.message}
              </p>
            )}
          </div>
        )}

        {/* Info */}
        <div className="rounded-lg bg-muted p-4">
          <p className="mb-2 text-sm font-medium">💡 Tip</p>
          <p className="text-xs text-muted-foreground">
            Los pagos de cuenta corriente se pueden incluir directamente al registrar una transacción desde el módulo de Pagos.
          </p>
        </div>
      </div>
    </div>
  );
}
