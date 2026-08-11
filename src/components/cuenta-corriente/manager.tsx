'use client';

import { useState, useEffect, useRef } from 'react';
import { registrarMovimiento, cerrarCuentaCorriente, reabrirCuentaCorriente } from '@/lib/actions-cuenta-corriente';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';

type Socio = {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  resumenCuotas: {
    cantidadPagadas: number;
    totalPagado: number;
    deudaActual: number;
  };
  cuotasPagadas: {
    id: string;
    suscripcionId: string;
    planNombre: string;
    monto: number;
    fecha: Date;
    metodoPago: string;
    notas: string | null;
  }[];
  cuentaCorriente: {
    id: string;
    saldoDeuda: number;
    saldoCredito: number;
    estado: string;
    movimientos: {
      id: string;
      tipo: string;
      monto: number;
      descripcion: string;
      createdAt: Date;
    }[];
  } | null;
};

export default function CuentaCorrienteManager({ socio }: { socio: Socio }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<string>('DEUDA');
  const formRef = useRef<HTMLFormElement>(null);
  
  const initialState = { message: '', errors: {}, success: false };
  const [stateMovimiento, formActionMovimiento] = useFormState(registrarMovimiento, initialState);
  const [stateCerrar, formActionCerrar] = useFormState(cerrarCuentaCorriente, initialState);
  const [stateReabrir, formActionReabrir] = useFormState(reabrirCuentaCorriente, initialState);

  // Refrescar cuando hay éxito
  useEffect(() => {
    if (stateMovimiento?.success) {
      formRef.current?.reset();
      setTimeout(() => {
        router.refresh();
      }, 1500);
    }
  }, [stateMovimiento?.success, router]);

  useEffect(() => {
    if (stateCerrar?.success || stateReabrir?.success) {
      setTimeout(() => {
        router.refresh();
      }, 1000);
    }
  }, [stateCerrar?.success, stateReabrir?.success, router]);

  const cuentaCorriente = socio.cuentaCorriente;
  if (!cuentaCorriente) {
    return (
      <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900 p-4">
        <p className="text-yellow-800 dark:text-yellow-200">
          Este socio no tiene una cuenta corriente activa.
        </p>
      </div>
    );
  }

  const saldoNeto = cuentaCorriente.saldoDeuda - cuentaCorriente.saldoCredito;
  const puedeRegistrarMovimientos = cuentaCorriente.estado !== 'CERRADO'; // Permite movimientos en ACTIVO y SALDADO
  const puedeCerrar = cuentaCorriente.estado !== 'CERRADO' && saldoNeto === 0; // Solo si el saldo es 0
  const puedeReabrir = cuentaCorriente.estado === 'CERRADO';
  const cuotasPagadas = socio.cuotasPagadas ?? [];
  const resumenCuotas = socio.resumenCuotas;

  return (
    <div className="space-y-6">
      {/* Header con info del socio */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {socio.apellido}, {socio.nombre}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">DNI: {socio.dni}</p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
            cuentaCorriente.estado === 'ACTIVO'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : cuentaCorriente.estado === 'SALDADO'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
          }`}>
            {cuentaCorriente.estado}
          </span>
        </div>
      </div>

      {/* Resumen de saldos */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Deuda</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">
            ${cuentaCorriente.saldoDeuda.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Crédito</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            ${cuentaCorriente.saldoCredito.toFixed(2)}
          </p>
        </div>
        <div className={`rounded-lg p-4 ${
          saldoNeto > 0
            ? 'bg-orange-50 dark:bg-orange-900/20'
            : saldoNeto < 0
            ? 'bg-blue-50 dark:bg-blue-900/20'
            : 'bg-gray-50 dark:bg-gray-700'
        }`}>
          <p className={`text-sm font-medium ${
            saldoNeto > 0
              ? 'text-orange-600 dark:text-orange-400'
              : saldoNeto < 0
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            Saldo Neto
          </p>
          <p className={`text-2xl font-bold ${
            saldoNeto > 0
              ? 'text-orange-700 dark:text-orange-300'
              : saldoNeto < 0
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            ${Math.abs(saldoNeto).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Resumen e historial de cuotas */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cuotas del Socio
        </h2>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Cuotas Pagadas</p>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
              {resumenCuotas.cantidadPagadas}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Pagado en Cuotas</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              ${resumenCuotas.totalPagado.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Adeuda Actualmente</p>
            <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
              ${resumenCuotas.deudaActual.toFixed(2)}
            </p>
          </div>
        </div>

        {cuotasPagadas.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
            Este socio todavía no registra pagos de cuota.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700/40 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {cuotasPagadas.map((cuota) => (
                  <tr key={cuota.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3">
                      {new Date(cuota.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">{cuota.planNombre}</td>
                    <td className="px-4 py-3">{cuota.metodoPago}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-300">
                      ${cuota.monto.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulario para registrar movimiento */}
      {puedeRegistrarMovimientos && (
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Registrar Movimiento
          </h2>
          
          {stateMovimiento?.message && (
            <div className={`mb-4 rounded-lg p-4 ${
              stateMovimiento.success
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              <p className="font-medium">{stateMovimiento.message}</p>
              {stateMovimiento.errors && Object.keys(stateMovimiento.errors).length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm">
                  {Object.entries(stateMovimiento.errors).map(([key, errors]) => 
                    errors?.map((error: string, idx: number) => (
                      <li key={`${key}-${idx}`}>{error}</li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}

          <form ref={formRef} action={formActionMovimiento} className="space-y-4">
            <input type="hidden" name="cuentaCorrienteId" value={cuentaCorriente.id} />
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Movimiento
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                >
                  <option value="DEUDA">Registrar Deuda</option>
                  <option value="CREDITO">Registrar Crédito</option>
                  <option value="PAGO">Aplicar Pago</option>
                  <option value="AJUSTE">Ajuste</option>
                </select>
              </div>

              <div>
                <label htmlFor="monto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  id="monto"
                  name="monto"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  required
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                placeholder="Describe el motivo del movimiento..."
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Registrar Movimiento
            </button>
          </form>
        </div>
      )}

      {/* Botón para cerrar cuenta */}
      {puedeCerrar && (
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <form action={formActionCerrar}>
            <input type="hidden" name="cuentaCorrienteId" value={cuentaCorriente.id} />
            <button
              type="submit"
              className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-500"
              onClick={(e) => {
                if (!confirm('¿Está seguro de cerrar esta cuenta corriente?')) {
                  e.preventDefault();
                }
              }}
            >
              Cerrar Cuenta Corriente
            </button>
          </form>
        </div>
      )}

      {/* Botón para reabrir cuenta */}
      {puedeReabrir && (
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Esta cuenta está cerrada. Puede reabrirla para registrar nuevos movimientos.
            </p>
          </div>
          <form action={formActionReabrir}>
            <input type="hidden" name="cuentaCorrienteId" value={cuentaCorriente.id} />
            <button
              type="submit"
              className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
              onClick={(e) => {
                if (!confirm('¿Está seguro de reabrir esta cuenta corriente?')) {
                  e.preventDefault();
                }
              }}
            >
              Reabrir Cuenta Corriente
            </button>
          </form>
        </div>
      )}

      {/* Historial de movimientos */}
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Historial de Movimientos
        </h2>

        {cuentaCorriente.movimientos.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No hay movimientos registrados.
          </p>
        ) : (
          <div className="space-y-3">
            {cuentaCorriente.movimientos.map((mov) => (
              <div
                key={mov.id}
                className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      mov.tipo === 'DEUDA'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        : mov.tipo === 'CREDITO'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : mov.tipo === 'PAGO'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {mov.tipo}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(mov.createdAt).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{mov.descripcion}</p>
                </div>
                <div className="ml-4 text-right">
                  <p className={`text-lg font-bold ${
                    mov.tipo === 'DEUDA'
                      ? 'text-red-600 dark:text-red-400'
                      : mov.tipo === 'CREDITO'
                      ? 'text-green-600 dark:text-green-400'
                      : mov.tipo === 'PAGO'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {mov.tipo === 'DEUDA' || mov.tipo === 'CREDITO' ? '+' : '-'}${mov.monto.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
