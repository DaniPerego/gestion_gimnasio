'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TransaccionesDB, SuscripcionesDB, CuentasCorrientesDB, MovimientosCCDB } from '@/lib/db';
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

function buildRenewalDates(baseDate: Date, duracionMeses: number) {
  const fechaInicio = new Date(baseDate);
  fechaInicio.setHours(12, 0, 0, 0);
  const fechaFin = new Date(fechaInicio);
  fechaFin.setMonth(fechaFin.getMonth() + duracionMeses);
  if (fechaFin.getDate() !== fechaInicio.getDate()) {
    fechaFin.setDate(0);
  }
  fechaFin.setHours(23, 59, 59, 999);
  return { fechaInicio, fechaFin };
}

export default function Form({ suscripciones, logoUrl }: { suscripciones: SuscripcionWithRelations[], logoUrl?: string | null }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const [showTicket, setShowTicket] = useState(false);
  const [selectedSuscripcion, setSelectedSuscripcion] = useState<SuscripcionWithRelations | null>(null);
  const [incluirCuentaCorriente, setIncluirCuentaCorriente] = useState(false);
  const [tipoPago, setTipoPago] = useState<'CUOTA_SUSCRIPCION' | 'OTRO'>('OTRO');
  const [montoCuota, setMontoCuota] = useState<number>(0);
  const [montoCuentaCorriente, setMontoCuentaCorriente] = useState<number>(0);
  const [createdTransaccion, setCreatedTransaccion] = useState<any>(null);

  const totalACobrar = montoCuota + montoCuentaCorriente;

  const handleCloseTicket = () => {
    setShowTicket(false);
    router.push('/admin/transacciones');
  };

  const ticketData = createdTransaccion ? {
    id: createdTransaccion.id,
    socioNombre: `${createdTransaccion.suscripcion.socio.nombre} ${createdTransaccion.suscripcion.socio.apellido}`,
    planNombre: createdTransaccion.suscripcion.plan.nombre,
    tipoPago: createdTransaccion.tipoPago,
    monto: Number(createdTransaccion.monto),
    fecha: createdTransaccion.fecha,
    fechaVencimiento: createdTransaccion.suscripcion.fechaFin,
    metodoPago: createdTransaccion.metodoPago,
    notas: createdTransaccion.notas,
    telefonoSocio: createdTransaccion.suscripcion.socio.telefono
  } : null;

  const cuentaCorriente = selectedSuscripcion?.socio?.cuentaCorriente;
  const tieneCuentaCorriente = cuentaCorriente && cuentaCorriente.estado === 'ACTIVO';
  const saldoDeuda = tieneCuentaCorriente ? cuentaCorriente.saldoDeuda : 0;
  const saldoCredito = tieneCuentaCorriente ? cuentaCorriente.saldoCredito : 0;
  const saldoNeto = saldoDeuda - saldoCredito;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    const suscripcionId = selectedSuscripcion?.id || '';
    const metodoPago = formData.get('metodoPago') as string;
    const notas = formData.get('notas') as string;
    const fecha = formData.get('fecha') as string;

    if (!suscripcionId) {
      setError('Debe seleccionar una suscripción.');
      setIsPending(false);
      return;
    }
    if (!metodoPago) {
      setError('Seleccione un método de pago.');
      setIsPending(false);
      return;
    }
    if (!notas?.trim()) {
      setError('La descripción es requerida.');
      setIsPending(false);
      return;
    }
    if (totalACobrar <= 0) {
      setError('Debe ingresar un monto mayor a $0.');
      setIsPending(false);
      return;
    }

    try {
      const suscripcion = SuscripcionesDB.findUnique(
        { id: suscripcionId },
        { plan: true }
      );
      if (!suscripcion) {
        setError('La suscripción seleccionada no existe.');
        setIsPending(false);
        return;
      }

      const montoTotal = totalACobrar;
      let notasCompletas = notas || '';
      if (incluirCuentaCorriente && montoCuentaCorriente > 0 && montoCuota > 0) {
        notasCompletas = `Cuota: $${montoCuota.toFixed(2)} + Cuenta Corriente: $${montoCuentaCorriente.toFixed(2)} = Total: $${montoTotal.toFixed(2)}${notas ? ' | ' + notas : ''}`;
      } else if (incluirCuentaCorriente && montoCuentaCorriente > 0) {
        notasCompletas = `Cuenta Corriente: $${montoCuentaCorriente.toFixed(2)}${notas ? ' | ' + notas : ''}`;
      }

      const newTransaccion = TransaccionesDB.create({
        suscripcionId,
        tipoPago,
        monto: montoTotal,
        metodoPago,
        fecha: fecha ? new Date(fecha) : new Date(),
        notas: notasCompletas,
      });

      if (tipoPago === 'CUOTA_SUSCRIPCION' && montoCuota > 0) {
        const fechaPagoBase = fecha ? new Date(fecha) : new Date();
        const { fechaInicio, fechaFin } = buildRenewalDates(fechaPagoBase, suscripcion.plan?.duracionMeses || 1);
        SuscripcionesDB.update({ id: suscripcionId }, {
          fechaInicio,
          fechaFin,
          activa: true,
        });
      }

      if (incluirCuentaCorriente && cuentaCorriente?.id && montoCuentaCorriente > 0) {
        const cc = CuentasCorrientesDB.findUnique({ id: cuentaCorriente.id });
        if (cc && cc.estado === 'ACTIVO') {
          let nuevoSaldoDeuda = cc.saldoDeuda;
          let nuevoSaldoCredito = cc.saldoCredito;
          let montoPendiente = montoCuentaCorriente;

          if (nuevoSaldoDeuda > 0) {
            if (montoPendiente >= nuevoSaldoDeuda) {
              montoPendiente -= nuevoSaldoDeuda;
              nuevoSaldoDeuda = 0;
            } else {
              nuevoSaldoDeuda -= montoPendiente;
              montoPendiente = 0;
            }
          }
          if (montoPendiente > 0) {
            if (nuevoSaldoCredito > 0) {
              if (montoPendiente >= nuevoSaldoCredito) {
                montoPendiente -= nuevoSaldoCredito;
                nuevoSaldoCredito = 0;
              } else {
                nuevoSaldoCredito -= montoPendiente;
                montoPendiente = 0;
              }
            } else {
              nuevoSaldoCredito = montoPendiente;
            }
          }

          const nuevoEstado = nuevoSaldoDeuda === 0 && nuevoSaldoCredito === 0 ? 'SALDADO' : 'ACTIVO';

          MovimientosCCDB.create({
            cuentaCorrienteId: cuentaCorriente.id,
            tipo: 'PAGO',
            monto: montoCuentaCorriente,
            descripcion: montoCuota > 0
              ? `Pago de cuota + cuenta corriente (Transacción #${newTransaccion.id})`
              : `Pago de cuenta corriente (Transacción #${newTransaccion.id})`,
            transaccionId: newTransaccion.id,
          });

          CuentasCorrientesDB.update({ id: cuentaCorriente.id }, {
            saldoDeuda: nuevoSaldoDeuda,
            saldoCredito: nuevoSaldoCredito,
            estado: nuevoEstado,
          });
        }
      }

      // Enrich the created transaccion for ticket
      const enriched = {
        ...newTransaccion,
        suscripcion: {
          ...suscripcion,
          socio: suscripcion.socio || selectedSuscripcion?.socio,
          plan: suscripcion.plan || selectedSuscripcion?.plan,
        }
      };
      setCreatedTransaccion(enriched);
      setShowTicket(true);
    } catch {
      setError('Error al registrar la transacción. Intente nuevamente.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      {showTicket && ticketData && (
        <TicketReceipt data={ticketData} onClose={handleCloseTicket} logoUrl={logoUrl} />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Seleccionar Suscripción
            </h3>
            <SuscripcionSearchSelect
              suscripciones={suscripciones}
              onSuscripcionChange={(susc) => {
                setSelectedSuscripcion(susc);
                setTipoPago('OTRO');
              }}
            />

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

          {selectedSuscripcion && tieneCuentaCorriente && (
            <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 shadow-sm border-2 border-orange-300 dark:border-orange-700">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-4">
                Cuenta Corriente
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-700 dark:text-orange-300">Deuda:</span>
                  <span className="text-xl font-bold text-red-600 dark:text-red-400">${saldoDeuda.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-700 dark:text-orange-300">Crédito:</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">${saldoCredito.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t-2 border-orange-300 dark:border-orange-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-200">Saldo Neto:</span>
                    <span className={`text-2xl font-bold ${saldoNeto > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      ${saldoNeto.toFixed(2)}
                    </span>
                  </div>
                </div>

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
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Detalles del Pago
          </h3>

          {selectedSuscripcion && (
            <div className="mb-4 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  Cuota del plan <span className="font-semibold">{selectedSuscripcion.plan.nombre}</span>: ${selectedSuscripcion.plan.precio.toFixed(2)}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMontoCuota(selectedSuscripcion.plan.precio);
                      setTipoPago('CUOTA_SUSCRIPCION');
                    }}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Marcar como cuota
                  </button>
                  {tipoPago === 'CUOTA_SUSCRIPCION' && (
                    <button
                      type="button"
                      onClick={() => { setTipoPago('OTRO'); setMontoCuota(0); }}
                      className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Marcar como otro pago
                    </button>
                  )}
                </div>
              </div>
              {tipoPago === 'CUOTA_SUSCRIPCION' && (
                <p className="mt-2 text-xs text-blue-800 dark:text-blue-300">
                  Este pago renovará automáticamente la suscripción al registrar.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                value={montoCuota}
                onChange={(e) => setMontoCuota(parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                placeholder="Ingrese el monto"
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 px-3 text-sm"
              />
            </div>

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
          </div>

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
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="TARJETA_DEBITO">Tarjeta Débito</option>
              <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>
        </div>

        {(incluirCuentaCorriente || montoCuota > 0) && (
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 shadow-sm border-2 border-blue-300 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
              Resumen del Cobro
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
            {isPending
              ? 'Registrando...'
              : tipoPago === 'CUOTA_SUSCRIPCION'
                ? 'Registrar Pago y Renovar'
                : 'Registrar Pago'}
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}
      </form>
    </>
  );
}
