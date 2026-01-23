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
    // Crear transacción principal
    const transaccion = await prisma.transaccion.create({
      data: {
        suscripcionId,
        monto,
        metodoPago,
        notas: notas || null,
      },
    });

    // Si se incluye pago de cuenta corriente, registrar el movimiento
    if (incluirCuentaCorriente && cuentaCorrienteId && montoCuentaCorriente && montoCuentaCorriente > 0) {
      const cuentaCorriente = await prisma.cuentaCorriente.findUnique({
        where: { id: cuentaCorrienteId },
      });

      if (cuentaCorriente && cuentaCorriente.estado === 'ACTIVO') {
        // Calcular nuevos saldos
        let nuevoSaldoDeuda = cuentaCorriente.saldoDeuda;
        let nuevoSaldoCredito = cuentaCorriente.saldoCredito;

        // Primero pagar deuda si existe
        if (nuevoSaldoDeuda.greaterThan(0)) {
          const montoAPagarDeuda = nuevoSaldoDeuda.greaterThanOrEqualTo(montoCuentaCorriente)
            ? montoCuentaCorriente
            : nuevoSaldoDeuda.toNumber();
          nuevoSaldoDeuda = nuevoSaldoDeuda.minus(montoAPagarDeuda);
        }

        // Si queda monto, pagar crédito
        const montoRestante = montoCuentaCorriente - (cuentaCorriente.saldoDeuda.toNumber() - nuevoSaldoDeuda.toNumber());
        if (montoRestante > 0 && nuevoSaldoCredito.greaterThan(0)) {
          const resultadoCredito = nuevoSaldoCredito.minus(montoRestante);
          nuevoSaldoCredito = resultadoCredito.lessThan(0)
            ? new Decimal(0)
            : resultadoCredito;
        }

        // Registrar movimiento y actualizar saldos
        await prisma.$transaction([
          prisma.movimientoCuentaCorriente.create({
            data: {
              cuentaCorrienteId,
              tipo: 'PAGO',
              monto: montoCuentaCorriente,
              descripcion: `Pago mediante transacción #${transaccion.id}`,
              transaccionId: transaccion.id,
            },
          }),
          prisma.cuentaCorriente.update({
            where: { id: cuentaCorrienteId },
            data: {
              saldoDeuda: nuevoSaldoDeuda,
              saldoCredito: nuevoSaldoCredito,
              estado:
                nuevoSaldoDeuda.equals(0) && nuevoSaldoCredito.equals(0)
                  ? 'SALDADO'
                  : 'ACTIVO',
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
  redirect('/admin/transacciones');
}
