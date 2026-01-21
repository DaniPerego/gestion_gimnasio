'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { createTransaccion } from '@/lib/actions-transacciones';
import SuscripcionSearchSelect from './suscripcion-search-select';
import { useRouter } from 'next/navigation';
import TicketReceipt from './ticket-receipt';

type SuscripcionWithRelations = {
  id: string;
  socio: { nombre: string; apellido: string; dni: string; telefono?: string | null };
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

  return (
    <>
      {showTicket && ticketData && (
        <TicketReceipt data={ticketData} onClose={handleCloseTicket} logoUrl={logoUrl} />
      )}

      <form action={dispatch}>
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          {/* Suscripción */}
          <div className="mb-4">
            <label htmlFor="suscripcionId" className="mb-2 block text-sm font-medium text-gray-900">
              Seleccionar Suscripción
            </label>
            <SuscripcionSearchSelect suscripciones={suscripciones} />
            <div id="suscripcion-error" aria-live="polite" aria-atomic="true">
              {state.errors?.suscripcionId &&
                state.errors.suscripcionId.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Monto */}
          <div className="mb-4">
            <label htmlFor="monto" className="mb-2 block text-sm font-medium text-gray-900">
              Monto
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="monto"
                  name="monto"
                  type="number"
                  step="0.01"
                  placeholder="Ingrese el monto"
                  className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="monto-error"
                />
              </div>
            </div>
            <div id="monto-error" aria-live="polite" aria-atomic="true">
              {state.errors?.monto &&
                state.errors.monto.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Fecha */}
          <div className="mb-4">
            <label htmlFor="fecha" className="mb-2 block text-sm font-medium text-gray-900">
              Fecha de Pago (opcional)
            </label>
            <div className="relative">
              <input
                id="fecha"
                name="fecha"
                type="date"
                className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="fecha-error"
              />
            </div>
            <div id="fecha-error" aria-live="polite" aria-atomic="true">
              {state.errors?.fecha &&
                state.errors.fecha.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">Si no se especifica, se usará la fecha actual</p>
          </div>

          {/* Notas */}
          <div className="mb-4">
            <label htmlFor="notas" className="mb-2 block text-sm font-medium text-gray-900">
              Notas
            </label>
            <div className="relative">
              <input
                id="notas"
                name="notas"
                type="text"
                placeholder="Ej: Pago mensualidad, Compra bebida"
                className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="notas-error"
              />
            </div>
            <div id="notas-error" aria-live="polite" aria-atomic="true">
              {state.errors?.notas &&
                state.errors.notas.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Metodo Pago */}
          <div className="mb-4">
            <label htmlFor="metodoPago" className="mb-2 block text-sm font-medium text-gray-900">
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

          <div aria-live="polite" aria-atomic="true">
              {state.message && (
                  <p className={`mt-2 text-sm ${state.success ? 'text-green-500' : 'text-red-500'}`} key={state.message}>
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
          <button type="submit" aria-disabled={isPending} className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              {isPending ? 'Registrando...' : 'Registrar Transacción'}
          </button>
        </div>
      </form>
    </>
  );
}
