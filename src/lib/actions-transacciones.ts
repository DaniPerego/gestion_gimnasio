'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Decimal } from '@prisma/client/runtime/library';

const FormSchema = z.object({
  id: z.string(),
  suscripcionId: z.string().min(1, 'Debe seleccionar una suscripción'),
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

export async function createTransaccion(prevState: unknown, formData: FormData) {
  const validatedFields = CreateTransaccion.safeParse({
    suscripcionId: formData.get('suscripcionId'),
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

  const { suscripcionId, monto, metodoPago, fecha, notas, incluirCuentaCorriente, montoCuentaCorriente, cuentaCorrienteId } = validatedFields.data;

  try {
    // Calcular monto total
    const montoTotal = monto + (incluirCuentaCorriente && montoCuentaCorriente ? montoCuentaCorriente : 0);
    let notasCompletas = notas || '';
    
    if (incluirCuentaCorriente && montoCuentaCorriente && montoCuentaCorriente > 0) {
      // Si hay cuota Y cuenta corriente
      if (monto > 0) {
        notasCompletas = `Cuota: $${monto.toFixed(2)} + Cuenta Corriente: $${montoCuentaCorriente.toFixed(2)} = Total: $${montoTotal.toFixed(2)}${notas ? ' | ' + notas : ''}`;
      } else {
        // Solo cuenta corriente
        notasCompletas = `Cuenta Corriente: $${montoCuentaCorriente.toFixed(2)}${notas ? ' | ' + notas : ''}`;
      }
    }

    // Crear transacción principal con monto total
    const newTransaccion = await prisma.transaccion.create({
      data: {
        suscripcionId,
        monto: montoTotal,
        metodoPago,
        ...(fecha && { fecha: new Date(fecha) }),
        notas: notasCompletas,
      },
      include: {
        suscripcion: {
          include: {
            socio: true,
            plan: true,
          },
        },
      },
    });

    // Si se incluye pago de cuenta corriente, registrar el movimiento
    if (incluirCuentaCorriente && cuentaCorrienteId && montoCuentaCorriente && montoCuentaCorriente > 0) {
      const cuentaCorriente = await prisma.cuentaCorriente.findUnique({
        where: { id: cuentaCorrienteId },
      });

      if (cuentaCorriente && cuentaCorriente.estado === 'ACTIVO') {
        let nuevoSaldoDeuda = cuentaCorriente.saldoDeuda;
        let nuevoSaldoCredito = cuentaCorriente.saldoCredito;
        let montoPendiente = new Decimal(montoCuentaCorriente);

        // Primero, aplicar al saldo de deuda
        if (nuevoSaldoDeuda.greaterThan(0)) {
          if (montoPendiente.greaterThanOrEqualTo(nuevoSaldoDeuda)) {
            montoPendiente = montoPendiente.minus(nuevoSaldoDeuda);
            nuevoSaldoDeuda = new Decimal(0);
          } else {
            nuevoSaldoDeuda = nuevoSaldoDeuda.minus(montoPendiente);
            montoPendiente = new Decimal(0);
          }
        }

        // Si queda dinero, aplicar al crédito
        if (montoPendiente.greaterThan(0)) {
          if (nuevoSaldoCredito.greaterThan(0)) {
            if (montoPendiente.greaterThanOrEqualTo(nuevoSaldoCredito)) {
              montoPendiente = montoPendiente.minus(nuevoSaldoCredito);
              nuevoSaldoCredito = new Decimal(0);
            } else {
              nuevoSaldoCredito = nuevoSaldoCredito.minus(montoPendiente);
              montoPendiente = new Decimal(0);
            }
          } else {
            nuevoSaldoCredito = montoPendiente;
          }
        }

        const nuevoEstado = nuevoSaldoDeuda.equals(0) && nuevoSaldoCredito.equals(0)
          ? 'SALDADO'
          : 'ACTIVO';

        await prisma.$transaction([
          prisma.movimientoCuentaCorriente.create({
            data: {
              cuentaCorrienteId,
              tipo: 'PAGO',
              monto: new Decimal(montoCuentaCorriente),
              descripcion: `Pago de cuota + cuenta corriente (Transacción #${newTransaccion.id})`,
              transaccionId: newTransaccion.id,
            },
          }),
          prisma.cuentaCorriente.update({
            where: { id: cuentaCorrienteId },
            data: {
              saldoDeuda: nuevoSaldoDeuda,
              saldoCredito: nuevoSaldoCredito,
              estado: nuevoEstado,
            },
          }),
        ]);
      }
    }
    
    revalidatePath('/admin/transacciones');
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
  const validatedFields = FormSchema.safeParse({
    id: formData.get('id'),
    suscripcionId: formData.get('suscripcionId'),
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

  const { id, suscripcionId, monto, metodoPago, fecha, notas } = validatedFields.data;

  try {
    await prisma.transaccion.update({
      where: { id },
      data: {
        suscripcionId,
        monto,
        metodoPago,
        ...(fecha && { fecha: new Date(fecha) }),
        notas: notas || null,
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: 'Error de base de datos: No se pudo actualizar la transacción.',
    };
  }

  revalidatePath('/admin/transacciones');
  redirect('/admin/transacciones');
}

export async function deleteTransaccion(id: string) {
  try {
    await prisma.transaccion.delete({
      where: { id },
    });
  } catch (error) {
    console.error(error);
    return {
      message: 'Error de base de datos: No se pudo eliminar la transacción.',
    };
  }

  revalidatePath('/admin/transacciones');
}
