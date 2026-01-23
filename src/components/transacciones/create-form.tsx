'use client';

import Link from 'next/link';
import { useActionState, useState, useEffect, useRef } from 'react';
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
  const [busquedaSuscripcion, setBusquedaSuscripcion] = useState('');
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const cuentaCorriente = selectedSuscripcion?.socio?.cuentaCorriente;
  const tieneCuentaCorriente = cuentaCorriente && cuentaCorriente.estado === 'ACTIVO';
  const saldoDeuda = tieneCuentaCorriente ? cuentaCorriente.saldoDeuda : 0;
  const saldoCredito = tieneCuentaCorriente ? cuentaCorriente.saldoCredito : 0;
  const saldoNeto = saldoDeuda - saldoCredito;

  // Filtrar suscripciones según búsqueda
  const suscripcionesFiltradas = suscripciones.filter((susc) => {
    const texto = `${susc.socio.nombre} ${susc.socio.apellido} ${susc.socio.dni} ${susc.plan.nombre}`.toLowerCase();
    return texto.includes(busquedaSuscripcion.toLowerCase());
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setMostrarOpciones(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar monto de cuenta corriente cuando se marca el checkbox
  useEffect(() => {
    if (incluirCuentaCorriente && tieneCuentaCorriente && saldoNeto > 0) {
      // Por defecto, sugerir pagar toda la deuda
      setMontoCuentaCorriente(saldoNeto);
    } else if (!incluirCuentaCorriente) {
      setMontoCuentaCorriente(0);
    }
  }, [incluirCuentaCorriente, saldoNeto, tieneCuentaCorriente]);

  const montoTotal = montoCuota + (incluirCuentaCorriente ? montoCuentaCorriente : 0);

  const handleSeleccionarSuscripcion = (susc: SuscripcionConRelaciones) => {
    setSelectedSuscripcion(susc);
    setBusquedaSuscripcion(`${susc.socio.apellido}, ${susc.socio.nombre} - ${susc.plan.nombre}`);
    setMontoCuota(Number(susc.plan.precio));
    setMostrarOpciones(false);
  };

  const handleLimpiarSeleccion = () => {
    setSelectedSuscripcion(null);
    setBusquedaSuscripcion('');
    setMontoCuota(0);
    setIncluirCuentaCorriente(false);
  };

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4 md:p-6">
        {/* Suscripción */}
        <div className="mb-4" ref={wrapperRef}>
          <label htmlFor="busquedaSuscripcion" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Buscar Suscripción
          </label>
          <div className="relative">
            <input
              id="busquedaSuscripcion"
              type="text"
              value={busquedaSuscripcion}
              onChange={(e) => {
                setBusquedaSuscripcion(e.target.value);
                setMostrarOpciones(true);
              }}
              onFocus={() => setMostrarOpciones(true)}
              placeholder="Buscar por nombre, DNI o plan..."
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-10 pr-10 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-describedby="suscripcion-error"
            />
            <svg
              className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 dark:text-gray-400 peer-focus:text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {selectedSuscripcion && (
              <button
                type="button"
                onClick={handleLimpiarSeleccion}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Limpiar selección"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Lista de opciones */}
            {mostrarOpciones && busquedaSuscripcion && suscripcionesFiltradas.length > 0 && (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-300 dark:border-gray-600">
                {suscripcionesFiltradas.map((suscripcion) => {
                  const tieneCta = suscripcion.socio.cuentaCorriente;
                  const saldoCta = tieneCta 
                    ? suscripcion.socio.cuentaCorriente!.saldoDeuda - suscripcion.socio.cuentaCorriente!.saldoCredito 
                    : 0;
                  
                  return (
                    <button
                      key={suscripcion.id}
                      type="button"
                      onClick={() => handleSeleccionarSuscripcion(suscripcion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 border-b dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {suscripcion.socio.apellido}, {suscripcion.socio.nombre}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            DNI: {suscripcion.socio.dni} • {suscripcion.plan.nombre}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="font-semibold text-blue-600 dark:text-blue-400">
                            ${Number(suscripcion.plan.precio).toFixed(2)}
                          </p>
                          {tieneCta && saldoCta > 0 && (
                            <p className="text-xs text-orange-600 dark:text-orange-400">
                              ⚠️ Debe ${saldoCta.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {mostrarOpciones && busquedaSuscripcion && suscripcionesFiltradas.length === 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-300 dark:border-gray-600 p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No se encontraron suscripciones</p>
              </div>
            )}
          </div>
          
          {/* Hidden input para el form */}
          <input
            type="hidden"
            name="suscripcionId"
            value={selectedSuscripcion?.id || ''}
          />
          
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
          <div className="mb-4 rounded-lg border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950 p-4">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                  ⚠️ Cuenta Corriente Pendiente
                </p>
                <span className="text-xs bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100 px-2 py-1 rounded-full">
                  Activa
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white dark:bg-gray-800 rounded-md p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Deuda</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    ${saldoDeuda.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-md p-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Crédito</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${saldoCredito.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 rounded-md p-2">
                <p className="text-xs text-orange-700 dark:text-orange-300">Saldo Neto a Pagar</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  ${saldoNeto.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 bg-white dark:bg-gray-800 rounded-md p-3">
              <input
                type="checkbox"
                id="incluirCuentaCorriente"
                name="incluirCuentaCorriente"
                checked={incluirCuentaCorriente}
                onChange={(e) => setIncluirCuentaCorriente(e.target.checked)}
                value="true"
                className="h-4 w-4 mt-0.5 rounded border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="incluirCuentaCorriente" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Incluir pago de cuenta corriente en esta transacción
              </label>
            </div>

            {incluirCuentaCorriente && (
              <div className="mt-3 bg-white dark:bg-gray-800 rounded-md p-3">
                <label htmlFor="montoCuentaCorriente" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Monto a pagar de cuenta corriente
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="montoCuentaCorriente"
                    name="montoCuentaCorriente"
                    step="0.01"
                    min="0"
                    max={saldoNeto}
                    value={montoCuentaCorriente}
                    onChange={(e) => setMontoCuentaCorriente(Number(e.target.value))}
                    className="block flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setMontoCuentaCorriente(saldoNeto)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md"
                  >
                    Todo
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Máximo: ${saldoNeto.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Alerta si tiene crédito a favor */}
        {selectedSuscripcion && tieneCuentaCorriente && saldoNeto < 0 && (
          <div className="mb-4 rounded-lg border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950 p-4">
            <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
              ✅ Este socio tiene crédito a favor
            </p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              ${Math.abs(saldoNeto).toFixed(2)}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Este monto puede usarse para futuras cuotas
            </p>
          </div>
        )}

        {/* Hidden fields para cuenta corriente */}
        {incluirCuentaCorriente && cuentaCorriente && (
          <input type="hidden" name="cuentaCorrienteId" value={cuentaCorriente.id} />
        )}

        {/* Monto */}
        <div className="mb-4">
          <label htmlFor="monto" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
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
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-describedby="monto-error"
            />
          </div>
          {incluirCuentaCorriente && montoCuentaCorriente > 0 && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                💰 Resumen del Pago
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Cuota mensual:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">${montoCuota.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Cuenta corriente:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">${montoCuentaCorriente.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                  <span className="font-bold text-blue-900 dark:text-blue-100">Total a cobrar:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300 text-lg">${montoTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
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
