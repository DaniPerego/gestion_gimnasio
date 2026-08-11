'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { updateTransaccion } from '@/lib/actions-transacciones';
import SuscripcionSearchSelect from './suscripcion-search-select';
import { useRouter } from 'next/navigation';

type Transaccion = {
  id: string;
  tipoPago: string;
  monto: number;
  fecha: Date;
  metodoPago: string;
  notas: string | null;
  suscripcionId: string;
};

type SuscripcionWithRelations = {
  id: string;
  socio: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    cuentaCorriente?: {
      id: string;
      saldoDeuda: number;
      saldoCredito: number;
      estado: string;
    } | null;
  };
  plan: { nombre: string; precio: number };
};

export default function EditForm({
  transaccion,
  suscripciones,
}: {
  transaccion: Transaccion;
  suscripciones: SuscripcionWithRelations[];
}) {
  const initialState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(updateTransaccion, initialState);
  const router = useRouter();

  const fechaFormato = transaccion.fecha.toISOString().split('T')[0];

  // Redirigir después de mostrar mensaje de éxito
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/admin/transacciones');
        router.refresh();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <form action={dispatch}>
      <input type="hidden" name="id" value={transaccion.id} />
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Suscripción */}
        <div className="mb-4">
          <label htmlFor="suscripcionId" className="mb-2 block text-sm font-medium text-gray-900">
            Seleccionar Suscripción
          </label>
          <SuscripcionSearchSelect suscripciones={suscripciones} defaultValue={transaccion.suscripcionId} />
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
          <label htmlFor="tipoPago" className="mb-2 block text-sm font-medium text-gray-900">
            Tipo de Pago
          </label>
          <div className="relative">
            <select
              id="tipoPago"
              name="tipoPago"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={transaccion.tipoPago || 'OTRO'}
            >
              <option value="OTRO">Otro pago (no renueva suscripción)</option>
              <option value="CUOTA_SUSCRIPCION">Cuota de suscripción (renueva automáticamente)</option>
            </select>
          </div>
          <div id="tipoPago-error" aria-live="polite" aria-atomic="true">
            {state.errors?.tipoPago &&
              state.errors.tipoPago.map((error: string) => (
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
                defaultValue={transaccion.monto}
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
            Fecha de Pago
          </label>
          <div className="relative">
            <input
              id="fecha"
              name="fecha"
              type="date"
              defaultValue={fechaFormato}
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
              defaultValue={transaccion.notas || ''}
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
              defaultValue={transaccion.metodoPago}
              aria-describedby="metodo-error"
            >
              <option value="" disabled>
                Seleccione un método
              </option>
              <option value="EFECTIVO">💵 Efectivo</option>
              <option value="TRANSFERENCIA">🏦 Transferencia</option>
              <option value="TARJETA_DEBITO">💳 Tarjeta Débito</option>
              <option value="TARJETA_CREDITO">💳 Tarjeta Crédito</option>
              <option value="OTROS">📱 Otros</option>
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
            <p className={`mt-2 text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`} key={state.message}>
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
        <button
          type="submit"
          aria-disabled={isPending}
          className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
