'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { createTransaccion } from '@/lib/actions-transacciones';
import SuscripcionSearchSelect from './suscripcion-search-select';
import { useRouter } from 'next/navigation';
import TicketReceipt from './ticket-receipt';

type SuscripcionWithRelations = {
  id: string;
  socio: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    telefono?: string | null;
    cuentaCorriente?: {
      id: string;
      saldoDeuda: number;
      saldoCredito: number;
      estado: string;
    } | null;
  };
  plan: { nombre: string; precio: number };
};

// Interfaz para el estado de la acción
interface ActionState {
  errors?: {
    suscripcionId?: string[];
    monto?: string[];
    metodoPago?: string[];
    fecha?: string[];
    notas?: string[];
  };
  message?: string;
  success?: boolean;
  transaccion?: any; 
}

export default function Form({ suscripciones, logoUrl }: { suscripciones: SuscripcionWithRelations[], logoUrl?: string | null }) {
  const initialState: ActionState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(createTransaccion, initialState);
  const router = useRouter();
  const [showTicket, setShowTicket] = useState(false);
  const [selectedSuscripcion, setSelectedSuscripcion] = useState<SuscripcionWithRelations | null>(null);
  const [incluirCuentaCorriente, setIncluirCuentaCorriente] = useState(false);
  const [montoCuota, setMontoCuota] = useState<number>(0);
  const [montoCuentaCorriente, setMontoCuentaCorriente] = useState<number>(0);
  
  const totalACobrar = montoCuota + montoCuentaCorriente;

  // Detectar éxito y mostrar ticket
  useEffect(() => {
    if (state.success && state.transaccion) {
      setShowTicket(true);
    }
  }, [state.success, state.transaccion]);

  const handleCloseTicket = () => {
    setShowTicket(false);
    // Redirigir a la lista de transacciones después de cerrar el ticket
    router.push('/admin/transacciones');
    router.refresh();
  };

  // Preparar datos para el ticket
  const ticketData = state.transaccion ? {
    id: state.transaccion.id,
    socioNombre: `${state.transaccion.suscripcion.socio.nombre} ${state.transaccion.suscripcion.socio.apellido}`,
    planNombre: state.transaccion.suscripcion.plan.nombre,
    monto: Number(state.transaccion.monto),
    fecha: state.transaccion.fecha,
    metodoPago: state.transaccion.metodoPago,
    notas: state.transaccion.notas,
    telefonoSocio: state.transaccion.suscripcion.socio.telefono
  } : null;

  const cuentaCorriente = selectedSuscripcion?.socio?.cuentaCorriente;
  const tieneCuentaCorriente = cuentaCorriente && cuentaCorriente.estado === 'ACTIVO';
  const saldoDeuda = tieneCuentaCorriente ? cuentaCorriente.saldoDeuda : 0;
  const saldoCredito = tieneCuentaCorriente ? cuentaCorriente.saldoCredito : 0;
  const saldoNeto = saldoDeuda - saldoCredito;

  return (
    <>
      {showTicket && ticketData && (
        <TicketReceipt data={ticketData} onClose={handleCloseTicket} logoUrl={logoUrl} />
      )}

      <form action={dispatch} className="space-y-6">
        {/* Grid Principal: Suscripción y Cuenta Corriente lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarjeta: Seleccionar Suscripción */}
          <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              📋 Seleccionar Suscripción
            </h3>
            <SuscripcionSearchSelect 
              suscripciones={suscripciones}
              onSuscripcionChange={(susc) => {
                setSelectedSuscripcion(susc);
              }}
            />
            <div id="suscripcion-error" aria-live="polite" aria-atomic="true">
              {state.errors?.suscripcionId &&
                state.errors.suscripcionId.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>

            {/* Info del socio seleccionado */}
            {selectedSuscripcion && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedSuscripcion.socio.nombre} {selectedSuscripcion.socio.apellido}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  DNI: {selectedSuscripcion.socio.dni}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Plan: {selectedSuscripcion.plan.nombre}
                </p>
              </div>
            )}
          </div>

          {/* Tarjeta: Cuenta Corriente (solo si existe) */}
          {selectedSuscripcion && tieneCuentaCorriente && (
            <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 shadow-sm border-2 border-orange-300 dark:border-orange-700">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-4">
                💳 Cuenta Corriente
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-700 dark:text-orange-300">Deuda:</span>
                  <span className="text-xl font-bold text-red-600 dark:text-red-400">
                    ${saldoDeuda.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-700 dark:text-orange-300">Crédito:</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    ${saldoCredito.toFixed(2)}
                  </span>
                </div>
                
                <div className="pt-3 border-t-2 border-orange-300 dark:border-orange-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-200">Saldo Neto:</span>
                    <span className={`text-2xl font-bold ${saldoNeto > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      ${saldoNeto.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkbox para incluir pago */}
                {saldoNeto > 0 && (
                  <div className="mt-4 pt-4 border-t border-orange-300 dark:border-orange-700">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id="incluirCuentaCorriente"
                        checked={incluirCuentaCorriente}
                        onChange={(e) => {
                          setIncluirCuentaCorriente(e.target.checked);
                          if (e.target.checked) {
                            setMontoCuentaCorriente(saldoNeto);
                          } else {
                            setMontoCuentaCorriente(0);
                          }
                        }}
                        className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                      />
                      <label htmlFor="incluirCuentaCorriente" className="text-sm font-medium text-orange-900 dark:text-orange-200">
                        Incluir pago de cuenta corriente
                      </label>
                    </div>
                    
                    {incluirCuentaCorriente && (
                      <div>
                        <label htmlFor="montoCuentaCorriente" className="block text-xs font-medium text-orange-800 dark:text-orange-300 mb-1">
                          Monto a pagar:
                        </label>
                        <input
                          type="number"
                          id="montoCuentaCorriente"
                          value={montoCuentaCorriente}
                          onChange={(e) => setMontoCuentaCorriente(Number(e.target.value))}
                          step="0.01"
                          min="0.01"
                          max={saldoNeto}
                          className="w-full rounded-md border border-orange-300 dark:border-orange-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
                        />
                        <p className="mt-1 text-xs text-orange-700 dark:text-orange-300">
                          Máximo: ${saldoNeto.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hidden inputs para cuenta corriente - siempre enviar con valores por defecto */}
          <input type="hidden" name="incluirCuentaCorriente" value={incluirCuentaCorriente ? "true" : "false"} />
          <input type="hidden" name="montoCuentaCorriente" value={incluirCuentaCorriente ? montoCuentaCorriente : 0} />
          <input type="hidden" name="cuentaCorrienteId" value={incluirCuentaCorriente && cuentaCorriente?.id ? cuentaCorriente.id : ''} />
        </div>

        {/* Tarjeta: Detalles del Pago */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            💰 Detalles del Pago
          </h3>
          
          {/* Grid para Monto y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Monto */}
            <div>
              <label htmlFor="monto" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Monto {incluirCuentaCorriente && <span className="text-xs text-gray-500">(puede ser $0)</span>}
              </label>
              <input
                id="monto"
                name="monto"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                onChange={(e) => setMontoCuota(parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                placeholder="Ingrese el monto"
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 px-3 text-sm"
              />
              {state.errors?.monto && (
                <p className="mt-1 text-sm text-red-500">{state.errors.monto[0]}</p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label htmlFor="fecha" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha de Pago
              </label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 px-3 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Por defecto: fecha actual</p>
            </div>
          </div>

          {/* Descripción - Full width */}
          <div className="mb-4">
            <label htmlFor="notas" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción *
            </label>
            <input
              id="notas"
              name="notas"
              type="text"
              placeholder="Ej: Pago mensualidad, Compra bebida, Pago deuda"
              required
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 px-3 text-sm"
            />
            {state.errors?.notas && (
              <p className="mt-1 text-sm text-red-500">{state.errors.notas[0]}</p>
            )}
          </div>

          {/* Método de Pago */}
          <div>
            <label htmlFor="metodoPago" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Método de Pago *
            </label>
            <select
              id="metodoPago"
              name="metodoPago"
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 px-3 text-sm"
              defaultValue=""
            >
              <option value="" disabled>Seleccione un método</option>
              <option value="EFECTIVO">💵 Efectivo</option>
              <option value="TRANSFERENCIA">🏦 Transferencia</option>
              <option value="TARJETA_DEBITO">💳 Tarjeta Débito</option>
              <option value="TARJETA_CREDITO">💳 Tarjeta Crédito</option>
              <option value="OTROS">📱 Otros</option>
            </select>
            {state.errors?.metodoPago && (
              <p className="mt-1 text-sm text-red-500">{state.errors.metodoPago[0]}</p>
            )}
          </div>
        </div>

        {/* Desglose del Total (solo si hay montos) */}
        {(incluirCuentaCorriente || montoCuota > 0) && (
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 shadow-sm border-2 border-blue-300 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
              📊 Resumen del Cobro
            </h3>
            <div className="space-y-2 text-sm">
              {montoCuota > 0 && (
                <div className="flex justify-between text-blue-800 dark:text-blue-300">
                  <span>Cuota:</span>
                  <span className="font-semibold">${montoCuota.toFixed(2)}</span>
                </div>
              )}
              {incluirCuentaCorriente && montoCuentaCorriente > 0 && (
                <div className="flex justify-between text-blue-800 dark:text-blue-300">
                  <span>Cuenta Corriente:</span>
                  <span className="font-semibold">${montoCuentaCorriente.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t-2 border-blue-400 dark:border-blue-600 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-900 dark:text-blue-100">Total a Cobrar:</span>
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">${totalACobrar.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4 pt-4">
          <Link
            href="/admin/transacciones"
            className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-700 px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center rounded-lg bg-blue-600 dark:bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
          >
            {isPending ? 'Registrando...' : '✅ Registrar Pago'}
          </button>
        </div>

        {/* Mensaje de error general */}
        {state.message && !state.success && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-300">{state.message}</p>
          </div>
        )}
      </form>
    </>
  );
}