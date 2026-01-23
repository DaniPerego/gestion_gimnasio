'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Decimal } from '@prisma/client/runtime/library';

const FormSchema = z.object({
  id: z.string(),
  suscripcionId: z.string().min(1, 'Debe seleccionar una suscripción'),
  monto: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  metodoPago: z.string().min(1, 'Seleccione un método de pago'),
  notas: z.string().optional(),
  incluirCuentaCorriente: z.boolean().optional(),
  montoCuentaCorriente: z.coerce.number().optional(),
  cuentaCorrienteId: z.string().optional(),
});

const CreateTransaccion = FormSchema.omit({ id: true });

export async function createTransaccion(prevState: unknown, formData: FormData) {
  const validatedFields = CreateTransaccion.safeParse({
    suscripcionId: formData.get('suscripcionId'),
    monto: formData.get('monto'),
    metodoPago: formData.get('metodoPago'),
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

  const { suscripcionId, monto, metodoPago, notas, incluirCuentaCorriente, montoCuentaCorriente, cuentaCorrienteId } = validatedFields.data;

  try {
    // Calcular monto total y preparar notas con detalle
    const montoTotal = monto + (incluirCuentaCorriente && montoCuentaCorriente ? montoCuentaCorriente : 0);
    let notasCompletas = notas || '';
    
    if (incluirCuentaCorriente && montoCuentaCorriente && montoCuentaCorriente > 0) {
      notasCompletas = `Cuota: $${monto.toFixed(2)} + Cuenta Corriente: $${montoCuentaCorriente.toFixed(2)} = Total: $${montoTotal.toFixed(2)}${notas ? ' | ' + notas : ''}`;
    }

    // Crear transacción principal con monto total
    const transaccion = await prisma.transaccion.create({
      data: {
        suscripcionId,
        monto: montoTotal, // Guardar el monto total
        metodoPago,
        notas: notasCompletas,
      },
    });

    // Si se incluye pago de cuenta corriente, registrar el movimiento
    if (incluirCuentaCorriente && cuentaCorrienteId && montoCuentaCorriente && montoCuentaCorriente > 0) {
      const cuentaCorriente = await prisma.cuentaCorriente.findUnique({
        where: { id: cuentaCorrienteId },
      });

      if (cuentaCorriente && cuentaCorriente.estado === 'ACTIVO') {
        // El pago se aplica al saldo neto (deuda - crédito)
        let nuevoSaldoDeuda = cuentaCorriente.saldoDeuda;
        let nuevoSaldoCredito = cuentaCorriente.saldoCredito;
        let montoPendiente = new Decimal(montoCuentaCorriente);

        // Primero, aplicar al saldo de deuda
        if (nuevoSaldoDeuda.greaterThan(0)) {
          if (montoPendiente.greaterThanOrEqualTo(nuevoSaldoDeuda)) {
            // El pago cubre toda la deuda
            montoPendiente = montoPendiente.minus(nuevoSaldoDeuda);
            nuevoSaldoDeuda = new Decimal(0);
          } else {
            // El pago cubre parcialmente la deuda
            nuevoSaldoDeuda = nuevoSaldoDeuda.minus(montoPendiente);
            montoPendiente = new Decimal(0);
          }
        }

        // Si queda dinero después de pagar la deuda, aplicar al crédito
        if (montoPendiente.greaterThan(0)) {
          if (nuevoSaldoCredito.greaterThan(0)) {
            if (montoPendiente.greaterThanOrEqualTo(nuevoSaldoCredito)) {
              // El pago cubre todo el crédito
              montoPendiente = montoPendiente.minus(nuevoSaldoCredito);
              nuevoSaldoCredito = new Decimal(0);
            } else {
              // El pago cubre parcialmente el crédito
              nuevoSaldoCredito = nuevoSaldoCredito.minus(montoPendiente);
              montoPendiente = new Decimal(0);
            }
          } else {
            // No hay crédito, el monto sobrante se convierte en crédito a favor
            nuevoSaldoCredito = montoPendiente;
          }
        }

        // Determinar el nuevo estado
        const nuevoEstado = nuevoSaldoDeuda.equals(0) && nuevoSaldoCredito.equals(0)
          ? 'SALDADO'
          : 'ACTIVO';

        // Registrar movimiento y actualizar saldos en una transacción
        await prisma.$transaction([
          prisma.movimientoCuentaCorriente.create({
            data: {
              cuentaCorrienteId,
              tipo: 'PAGO',
              monto: new Decimal(montoCuentaCorriente),
              descripcion: `Pago de cuota + cuenta corriente (Transacción #${transaccion.id})`,
              transaccionId: transaccion.id,
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
  } catch (error) {
    console.error(error);
    return {
      message: 'Error de base de datos: No se pudo registrar la transacción.',
    };
  }

  revalidatePath('/admin/transacciones');
  revalidatePath('/admin/cuenta-corriente');
  redirect('/admin/transacciones');
}
