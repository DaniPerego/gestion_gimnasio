'use server';

import { z } from 'zod';
import { TransaccionesDB, SuscripcionesDB, PlanesDB, CuentasCorrientesDB, MovimientosCCDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

const FormSchema = z.object({
  id: z.string(),
  suscripcionId: z.string().min(1, 'Debe seleccionar una suscripción'),
  tipoPago: z.enum(['CUOTA_SUSCRIPCION', 'OTRO']),
  monto: z.coerce.number().min(0, 'El monto no puede ser negativo'),
  metodoPago: z.string().min(1, 'Seleccione un método de pago'),
  fecha: z.string().optional(),
  notas: z.string().min(1, 'La descripción es requerida'),
  incluirCuentaCorriente: z.boolean().optional(),
  montoCuentaCorriente: z.coerce.number().optional(),
  cuentaCorrienteId: z.string().optional(),
}).refine(
  (data) => {
    const monto = data.monto || 0;
    const montoCuentaC = data.montoCuentaCorriente || 0;
    return monto + montoCuentaC > 0;
  },
  {
    message: 'Debe ingresar un monto o un pago de cuenta corriente mayor a $0',
    path: ['monto'],
  }
);

const CreateTransaccion = FormSchema.omit({ id: true });

const UpdateTransaccionSchema = z.object({
  id: z.string(),
  suscripcionId: z.string().min(1, 'Debe seleccionar una suscripción'),
  tipoPago: z.enum(['CUOTA_SUSCRIPCION', 'OTRO']),
  monto: z.coerce.number().min(0, 'El monto no puede ser negativo'),
  metodoPago: z.string().min(1, 'Seleccione un método de pago'),
  fecha: z.string().optional(),
  notas: z.string().min(1, 'La descripción es requerida'),
});

export async function createTransaccion(prevState: unknown, formData: FormData) {
  const validatedFields = CreateTransaccion.safeParse({
    suscripcionId: formData.get('suscripcionId'),
    tipoPago: formData.get('tipoPago') ?? 'OTRO',
    monto: formData.get('monto'),
    metodoPago: formData.get('metodoPago'),
    fecha: formData.get('fecha'),
    notas: formData.get('notas'),
    incluirCuentaCorriente: formData.get('incluirCuentaCorriente') === 'true',
    montoCuentaCorriente: formData.get('montoCuentaCorriente'),
    cuentaCorrienteId: formData.get('cuentaCorrienteId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios. Error al registrar transacción.',
    };
  }

  const { suscripcionId, tipoPago, monto, metodoPago, fecha, notas, incluirCuentaCorriente, montoCuentaCorriente, cuentaCorrienteId } = validatedFields.data;

  try {
    const suscripcion = SuscripcionesDB.findUnique(
      { id: suscripcionId },
      { plan: true }
    );

    if (!suscripcion) {
      return {
        message: 'La suscripción seleccionada no existe.',
      };
    }

    const montoTotal = monto + (incluirCuentaCorriente && montoCuentaCorriente ? montoCuentaCorriente : 0);
    let notasCompletas = notas || '';
    
    if (incluirCuentaCorriente && montoCuentaCorriente && montoCuentaCorriente > 0) {
      if (monto > 0) {
        notasCompletas = `Cuota: $${monto.toFixed(2)} + Cuenta Corriente: $${montoCuentaCorriente.toFixed(2)} = Total: $${montoTotal.toFixed(2)}${notas ? ' | ' + notas : ''}`;
      } else {
        notasCompletas = `Cuenta Corriente: $${montoCuentaCorriente.toFixed(2)}${notas ? ' | ' + notas : ''}`;
      }
    }

    const newTransaccion = TransaccionesDB.create({
      suscripcionId,
      tipoPago,
      monto: montoTotal,
      metodoPago,
      fecha: fecha ? new Date(fecha) : new Date(),
      notas: notasCompletas,
    });

    if (tipoPago === 'CUOTA_SUSCRIPCION' && monto > 0) {
      const fechaPagoBase = fecha ? new Date(fecha) : new Date();
      const { fechaInicio, fechaFin } = buildRenewalDates(fechaPagoBase, suscripcion.plan?.duracionMeses || 1);

      SuscripcionesDB.update({ id: suscripcionId }, {
        fechaInicio,
        fechaFin,
        activa: true,
      });
    }

    if (incluirCuentaCorriente && cuentaCorrienteId && montoCuentaCorriente && montoCuentaCorriente > 0) {
      const cuentaCorriente = CuentasCorrientesDB.findUnique({ id: cuentaCorrienteId });

      if (cuentaCorriente && cuentaCorriente.estado === 'ACTIVO') {
        let nuevoSaldoDeuda = cuentaCorriente.saldoDeuda;
        let nuevoSaldoCredito = cuentaCorriente.saldoCredito;
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

        const nuevoEstado = nuevoSaldoDeuda === 0 && nuevoSaldoCredito === 0
          ? 'SALDADO'
          : 'ACTIVO';

        MovimientosCCDB.create({
          cuentaCorrienteId,
          tipo: 'PAGO',
          monto: montoCuentaCorriente,
          descripcion: monto > 0 
            ? `Pago de cuota + cuenta corriente (Transacción #${newTransaccion.id})`
            : `Pago de cuenta corriente (Transacción #${newTransaccion.id})`,
          transaccionId: newTransaccion.id,
        });

        CuentasCorrientesDB.update({ id: cuentaCorrienteId }, {
          saldoDeuda: nuevoSaldoDeuda,
          saldoCredito: nuevoSaldoCredito,
          estado: nuevoEstado,
        });
      }
    }
    
    revalidatePath('/admin/transacciones');
    revalidatePath('/admin/suscripciones');
    revalidatePath('/admin/asistencias');
    revalidatePath('/admin/cuenta-corriente');
    return {
      success: true,
      message: 'Transacción registrada correctamente',
      transaccion: newTransaccion,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Error de base de datos: No se pudo registrar la transacción.',
    };
  }
}

export async function updateTransaccion(prevState: unknown, formData: FormData) {
  const validatedFields = UpdateTransaccionSchema.safeParse({
    id: formData.get('id'),
    suscripcionId: formData.get('suscripcionId'),
    tipoPago: formData.get('tipoPago') ?? 'OTRO',
    monto: formData.get('monto'),
    metodoPago: formData.get('metodoPago'),
    fecha: formData.get('fecha'),
    notas: formData.get('notas'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios. Error al actualizar transacción.',
    };
  }

  const { id, suscripcionId, tipoPago, monto, metodoPago, fecha, notas } = validatedFields.data;

  try {
    TransaccionesDB.update({ id }, {
      suscripcionId,
      tipoPago,
      monto,
      metodoPago,
      fecha: fecha ? new Date(fecha) : undefined,
      notas: notas || null,
    });
  } catch (error) {
    console.error(error);
    return {
      message: 'Error de base de datos: No se pudo actualizar la transacción.',
    };
  }

  revalidatePath('/admin/transacciones');
  revalidatePath('/admin/suscripciones');
  revalidatePath('/admin/asistencias');
  revalidatePath('/admin/cuenta-corriente');
  return {
    success: true,
    message: 'Transacción actualizada correctamente',
  };
}

export async function deleteTransaccion(id: string) {
  try {
    TransaccionesDB.delete({ id });
  } catch (error) {
    console.error(error);
    return {
      message: 'Error de base de datos: No se pudo eliminar la transacción.',
    };
  }

  revalidatePath('/admin/transacciones');
}
