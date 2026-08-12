'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TransaccionesDB } from '@/lib/db';
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
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const fechaFormato = transaccion.fecha instanceof Date
    ? transaccion.fecha.toISOString().split('T')[0]
    : new Date(transaccion.fecha).toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    const suscripcionId = formData.get('suscripcionId') as string;
    const tipoPago = formData.get('tipoPago') as string;
    const monto = formData.get('monto') as string;
    const metodoPago = formData.get('metodoPago') as string;
    const fecha = formData.get('fecha') as string;
    const notas = formData.get('notas') as string;

    const errors: Record<string, string[]> = {};
    if (!suscripcionId) errors.suscripcionId = ['Debe seleccionar una suscripción'];
    if (!monto || isNaN(Number(monto)) || Number(monto) < 0) errors.monto = ['El monto no puede ser negativo'];
    if (!metodoPago) errors.metodoPago = ['Seleccione un método de pago'];
    if (!notas?.trim()) errors.notas = ['La descripción es requerida'];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsPending(false);
      return;
    }

    try {
      TransaccionesDB.update({ id: transaccion.id }, {
        suscripcionId,
        tipoPago: tipoPago || 'OTRO',
        monto: Number(monto),
        metodoPago,
        fecha: fecha ? new Date(fecha) : undefined,
        notas: notas || null,
      });
      router.push('/admin/transacciones');
    } catch {
      setError('Error al actualizar la transacción. Intente nuevamente.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={transaccion.id} />
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="suscripcionId" className="mb-2 block text-sm font-medium text-gray-900">
            Seleccionar Suscripción
          </label>
          <SuscripcionSearchSelect suscripciones={suscripciones} defaultValue={transaccion.suscripcionId} />
          {fieldErrors.suscripcionId && fieldErrors.suscripcionId.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="tipoPago" className="mb-2 block text-sm font-medium text-gray-900">
            Tipo de Pago
          </label>
          <select
            id="tipoPago"
            name="tipoPago"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            defaultValue={transaccion.tipoPago || 'OTRO'}
          >
            <option value="OTRO">Otro pago (no renueva suscripción)</option>
            <option value="CUOTA_SUSCRIPCION">Cuota de suscripción (renueva automáticamente)</option>
          </select>
          {fieldErrors.tipoPago && fieldErrors.tipoPago.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="monto" className="mb-2 block text-sm font-medium text-gray-900">
            Monto
          </label>
          <input
            id="monto"
            name="monto"
            type="number"
            step="0.01"
            defaultValue={transaccion.monto}
            placeholder="Ingrese el monto"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
          />
          {fieldErrors.monto && fieldErrors.monto.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="fecha" className="mb-2 block text-sm font-medium text-gray-900">
            Fecha de Pago
          </label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            defaultValue={fechaFormato}
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="notas" className="mb-2 block text-sm font-medium text-gray-900">
            Notas
          </label>
          <input
            id="notas"
            name="notas"
            type="text"
            defaultValue={transaccion.notas || ''}
            placeholder="Ej: Pago mensualidad, Compra bebida"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
          />
          {fieldErrors.notas && fieldErrors.notas.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="metodoPago" className="mb-2 block text-sm font-medium text-gray-900">
            Método de Pago
          </label>
          <select
            id="metodoPago"
            name="metodoPago"
            className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
            defaultValue={transaccion.metodoPago}
          >
            <option value="" disabled>Seleccione un método</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="TARJETA_DEBITO">Tarjeta Débito</option>
            <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
            <option value="OTROS">Otros</option>
          </select>
          {fieldErrors.metodoPago && fieldErrors.metodoPago.map((err: string) => (
            <p className="mt-2 text-sm text-red-500" key={err}>{err}</p>
          ))}
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
          disabled={isPending}
          className="flex h-10 items-center rounded-lg bg-[var(--primary-color)] px-4 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
