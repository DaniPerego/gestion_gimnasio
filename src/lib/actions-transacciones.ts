'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  suscripcionId: z.string().min(1, 'Debe seleccionar una suscripción'),
  monto: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  metodoPago: z.string().min(1, 'Seleccione un método de pago'),
  fecha: z.string().optional(),
  notas: z.string().optional(),
});

const CreateTransaccion = FormSchema.omit({ id: true });

export async function createTransaccion(prevState: unknown, formData: FormData) {
  const validatedFields = CreateTransaccion.safeParse({
    suscripcionId: formData.get('suscripcionId'),
    monto: formData.get('monto'),
    metodoPago: formData.get('metodoPago'),
    fecha: formData.get('fecha'),
    notas: formData.get('notas'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios. Error al registrar transacción.',
    };
  }

  const { suscripcionId, monto, metodoPago, fecha, notas } = validatedFields.data;

  try {
    const newTransaccion = await prisma.transaccion.create({
      data: {
        suscripcionId,
        monto,
        metodoPago,
        ...(fecha && { fecha: new Date(fecha) }),
        notas: notas || null,
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
    
    revalidatePath('/admin/transacciones');
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
