'use client';

import { useState } from 'react';
import { abrirCuentaCorriente, registrarMovimiento, cerrarCuentaCorriente } from '@/lib/actions-cuenta-corriente';
import { useFormState } from 'react-dom';

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
        <p className="mb-4 text-sm text-muted-foreground">
          El socio no tiene una cuenta corriente activa.
        </p>
        <form action={formActionAbrir}>
          <input type="hidden" name="socioId" value={socioId} />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Abrir Cuenta Corriente
          </button>
        </form>
        {stateAbrir.message && (
          <p className={`mt-2 text-sm ${stateAbrir.success ? 'text-green-600' : 'text-red-600'}`}>
            {stateAbrir.message}
          </p>
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
      <div className="mb-6 rounded-lg bg-muted p-4">
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

      {/* Botones de acción */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setShowMovimientoForm(!showMovimientoForm)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {showMovimientoForm ? 'Cancelar' : 'Registrar Movimiento'}
        </button>
        
        {saldoNeto === 0 && cuentaCorriente.estado === 'SALDADO' && (
          <form action={formActionCerrar}>
            <input type="hidden" name="cuentaCorrienteId" value={cuentaCorriente.id} />
            <button
              type="submit"
              className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Cerrar Cuenta
            </button>
          </form>
        )}
      </div>

      {/* Formulario de movimiento */}
      {showMovimientoForm && cuentaCorriente.estado === 'ACTIVO' && (
        <form action={formActionMovimiento} className="mb-6 rounded-lg border bg-muted p-4">
          <input type="hidden" name="cuentaCorrienteId" value={cuentaCorriente.id} />
          
          <div className="mb-3">
            <label htmlFor="tipo" className="mb-1 block text-sm font-medium">
              Tipo de Movimiento
            </label>
            <select
              id="tipo"
              name="tipo"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="DEUDA">Registrar Deuda (+)</option>
              <option value="CREDITO">Registrar Crédito (-)</option>
              <option value="AJUSTE">Ajuste Manual</option>
            </select>
          </div>

          <div className="mb-3">
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

          <div className="mb-3">
            <label htmlFor="descripcion" className="mb-1 block text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            <p className={`mt-2 text-sm ${stateMovimiento.success ? 'text-green-600' : 'text-red-600'}`}>
              {stateMovimiento.message}
            </p>
          )}
        </form>
      )}

      {/* Lista de movimientos */}
      {cuentaCorriente.movimientos && cuentaCorriente.movimientos.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium">Últimos Movimientos</h4>
          <div className="space-y-2">
            {cuentaCorriente.movimientos.map((mov) => (
              <div
                key={mov.id}
                className="flex items-start justify-between rounded-lg border bg-background p-3 text-sm"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
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
                    <span className="text-muted-foreground">
                      {new Date(mov.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{mov.descripcion}</p>
                </div>
                <p className="ml-2 font-medium">${mov.monto.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {stateCerrar.message && (
        <p className={`mt-2 text-sm ${stateCerrar.success ? 'text-green-600' : 'text-red-600'}`}>
          {stateCerrar.message}
        </p>
      )}
    </div>
  );
}
