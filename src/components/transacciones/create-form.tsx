'use client';

import Link from 'next/link';
import { useActionState, useState, useEffect } from 'react';
import { createTransaccion } from '@/lib/actions-transacciones';
import { Suscripcion, Socio, Plan } from '@prisma/client';

type SuscripcionConRelaciones = Suscripcion & {
  socio: Socio & {
    cuentaCorriente?: {
      id: string;
      saldoDeuda: number;
      saldoCredito: number;
      estado: string;
    } | null;
  };
  plan: Omit<Plan, 'precio'> & { precio: number };
};

export default function Form({ suscripciones }: { suscripciones: SuscripcionConRelaciones[] }) {
  const initialState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(createTransaccion, initialState);
  
  const [selectedSuscripcion, setSelectedSuscripcion] = useState<SuscripcionConRelaciones | null>(null);
  const [incluirCuentaCorriente, setIncluirCuentaCorriente] = useState(false);
  const [montoCuota, setMontoCuota] = useState<number>(0);
  const [montoCuentaCorriente, setMontoCuentaCorriente] = useState<number>(0);

  const cuentaCorriente = selectedSuscripcion?.socio?.cuentaCorriente;
  const tieneCuentaCorriente = cuentaCorriente && cuentaCorriente.estado === 'ACTIVO';
  const saldoNeto = tieneCuentaCorriente 
    ? cuentaCorriente.saldoDeuda - cuentaCorriente.saldoCredito 
    : 0;

  useEffect(() => {
    if (incluirCuentaCorriente && tieneCuentaCorriente && saldoNeto > 0) {
      setMontoCuentaCorriente(saldoNeto);
    } else {
      setMontoCuentaCorriente(0);
    }
  }, [incluirCuentaCorriente, saldoNeto, tieneCuentaCorriente]);

  const montoTotal = montoCuota + (incluirCuentaCorriente ? montoCuentaCorriente : 0);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Suscripción */}
        <div className="mb-4">
          <label htmlFor="suscripcionId" className="mb-2 block text-sm font-medium">
            Seleccionar Suscripción
          </label>
          <div className="relative">
            <select
              id="suscripcionId"
              name="suscripcionId"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="suscripcion-error"
              onChange={(e) => {
                const susc = suscripciones.find(s => s.id === e.target.value);
                setSelectedSuscripcion(susc || null);
                if (susc) {
                  setMontoCuota(Number(susc.plan.precio));
                }
              }}
            >
              <option value="" disabled>
                Seleccione una suscripción activa
              </option>
              {suscripciones.map((suscripcion) => (
                <option key={suscripcion.id} value={suscripcion.id}>
                  {suscripcion.socio.nombre} {suscripcion.socio.apellido} - {suscripcion.plan.nombre} (${Number(suscripcion.plan.precio)})
                </option>
              ))}
            </select>
          </div>
          <div id="suscripcion-error" aria-live="polite" aria-atomic="true">
            {state.errors?.suscripcionId &&
              state.errors.suscripcionId.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Cuenta Corriente Info */}
        {selectedSuscripcion && tieneCuentaCorriente && saldoNeto > 0 && (
          <div className="mb-4 rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Este socio tiene saldo pendiente
                </p>
                <p className="mt-1 text-lg font-bold text-orange-700">
                  Deuda: ${saldoNeto.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="incluirCuentaCorriente"
                name="incluirCuentaCorriente"
                checked={incluirCuentaCorriente}
                onChange={(e) => setIncluirCuentaCorriente(e.target.checked)}
                value="true"
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="incluirCuentaCorriente" className="text-sm font-medium text-orange-900">
                Incluir pago de cuenta corriente en esta transacción
              </label>
            </div>

            {incluirCuentaCorriente && (
              <div className="mt-3">
                <label htmlFor="montoCuentaCorriente" className="mb-1 block text-sm font-medium text-orange-900">
                  Monto a pagar de cuenta corriente
                </label>
                <input
                  type="number"
                  id="montoCuentaCorriente"
                  name="montoCuentaCorriente"
                  step="0.01"
                  min="0"
                  max={saldoNeto}
                  value={montoCuentaCorriente}
                  onChange={(e) => setMontoCuentaCorriente(Number(e.target.value))}
                  className="block w-full rounded-md border border-orange-300 bg-white py-2 pl-3 text-sm"
                />
                <p className="mt-1 text-xs text-orange-700">
                  Máximo: ${saldoNeto.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hidden fields para cuenta corriente */}
        {incluirCuentaCorriente && cuentaCorriente && (
          <input type="hidden" name="cuentaCorrienteId" value={cuentaCorriente.id} />
        )}

        {/* Monto */}
        <div className="mb-4">
          <label htmlFor="monto" className="mb-2 block text-sm font-medium">
            Monto de la Cuota
          </label>
          <div className="relative">
            <input
              id="monto"
              name="monto"
              type="number"
              step="0.01"
              min="0"
              value={montoCuota || ''}
              onChange={(e) => setMontoCuota(Number(e.target.value))}
              placeholder="Ingrese el monto"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="monto-error"
            />
          </div>
          {incluirCuentaCorriente && montoCuentaCorriente > 0 && (
            <p className="mt-2 text-sm font-medium text-blue-700">
              Total a cobrar: ${montoTotal.toFixed(2)} 
              <span className="text-gray-600"> (Cuota: ${montoCuota.toFixed(2)} + Cuenta Corriente: ${montoCuentaCorriente.toFixed(2)})</span>
            </p>
          )}
          <div id="monto-error" aria-live="polite" aria-atomic="true">
            {state.errors?.monto &&
              state.errors.monto.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Método de Pago */}
        <div className="mb-4">
          <label htmlFor="metodoPago" className="mb-2 block text-sm font-medium">
            Método de Pago
          </label>
          <div className="relative">
            <select
              id="metodoPago"
              name="metodoPago"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="metodo-error"
            >
              <option value="" disabled>
                Seleccione un método
              </option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div id="metodo-error" aria-live="polite" aria-atomic="true">
            {state.errors?.metodoPago &&
              state.errors.metodoPago.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Notas */}
        <div className="mb-4">
          <label htmlFor="notas" className="mb-2 block text-sm font-medium">
            Notas (Opcional)
          </label>
          <div className="relative">
            <textarea
              id="notas"
              name="notas"
              rows={3}
              placeholder="Notas adicionales"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
            {state.message && (
                <p className="mt-2 text-sm text-red-500" key={state.message}>
                    {state.message}
                </p>
            )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/transacciones"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <button type="submit" aria-disabled={isPending} className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {isPending ? 'Registrando...' : `Registrar Pago${incluirCuentaCorriente ? ` ($${montoTotal.toFixed(2)})` : ''}`}
        </button>
      </div>
    </form>
  );
}
