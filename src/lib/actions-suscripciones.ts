'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  socioId: z.string().min(1, 'Debe seleccionar un socio'),
  planId: z.string().min(1, 'Debe seleccionar un plan'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
});

const CreateSuscripcion = FormSchema.omit({ id: true });

export async function createSuscripcion(prevState: any, formData: FormData) {
  const validatedFields = CreateSuscripcion.safeParse({
    socioId: formData.get('socioId'),
    planId: formData.get('planId'),
    fechaInicio: formData.get('fechaInicio'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios. Error al crear suscripción.',
    };
  }

  const { socioId, planId, fechaInicio } = validatedFields.data;

  try {
    // Obtener detalles del plan para calcular fecha fin
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return { message: 'El plan seleccionado no existe.' };
    }

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaInicioDate);
    fechaFinDate.setMonth(fechaFinDate.getMonth() + plan.duracionMeses);

    await prisma.suscripcion.create({
      data: {
        socioId,
        planId,
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        activa: true,
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: 'Error de base de datos: No se pudo crear la suscripción.',
    };
  }

  revalidatePath('/admin/suscripciones');
  redirect('/admin/suscripciones');
}

export async function cancelSuscripcion(id: string) {
  try {
    await prisma.suscripcion.update({
      where: { id },
      data: { activa: false },
    });
    revalidatePath('/admin/suscripciones');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to cancel subscription.');
  }
}
