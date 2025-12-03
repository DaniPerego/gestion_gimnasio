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
    
    // Lógica de Mes Calendario:
    // La suscripción termina el último día del mes correspondiente a la duración.
    // Ejemplo: Inicio 3 Dic, Duración 1 mes -> Fin 31 Dic.
    // Ejemplo: Inicio 20 Dic, Duración 1 mes -> Fin 31 Dic.
    const fechaFinDate = new Date(fechaInicioDate);
    // Sumamos la duración en meses (menos 1 porque el mes actual cuenta)
    // Si es 1 mes, nos quedamos en el mes actual. Si son 2, vamos al siguiente.
    fechaFinDate.setMonth(fechaFinDate.getMonth() + plan.duracionMeses - 1);
    // Establecemos al último día del mes
    fechaFinDate.setMonth(fechaFinDate.getMonth() + 1);
    fechaFinDate.setDate(0); // Día 0 del siguiente mes es el último del actual
    
    // Ajustar horas para evitar problemas de zona horaria (opcional, pero recomendado setear a final del día)
    fechaFinDate.setHours(23, 59, 59, 999);

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

const UpdateSuscripcionSchema = z.object({
  fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fechaFin: z.string().min(1, 'La fecha de fin es obligatoria'),
});

export async function updateSuscripcion(id: string, prevState: any, formData: FormData) {
  const validatedFields = UpdateSuscripcionSchema.safeParse({
    fechaInicio: formData.get('fechaInicio'),
    fechaFin: formData.get('fechaFin'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios.',
    };
  }

  const { fechaInicio, fechaFin } = validatedFields.data;

  try {
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    // Set end of day for fechaFin
    fechaFinDate.setHours(23, 59, 59, 999);

    await prisma.suscripcion.update({
      where: { id },
      data: {
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
      },
    });
  } catch (error) {
    return {
      message: 'Error de base de datos: No se pudo actualizar la suscripción.',
    };
  }

  revalidatePath('/admin/suscripciones');
  redirect('/admin/suscripciones');
}
