'use server';

import { z } from 'zod';
import { SuscripcionesDB, PlanesDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  socioId: z.string().min(1, 'Debe seleccionar un socio'),
  planId: z.string().min(1, 'Debe seleccionar un plan'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
});

const CreateSuscripcion = FormSchema.omit({ id: true });

export async function createSuscripcion(prevState: unknown, formData: FormData) {
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
    const plan = PlanesDB.findUnique({ id: planId });

    if (!plan) {
      return { message: 'El plan seleccionado no existe.' };
    }

    const fechaInicioDate = new Date(fechaInicio);
    fechaInicioDate.setHours(12, 0, 0, 0);

    const fechaFinDate = new Date(fechaInicioDate);
    fechaFinDate.setMonth(fechaFinDate.getMonth() + plan.duracionMeses);
    if (fechaFinDate.getDate() !== fechaInicioDate.getDate()) {
      fechaFinDate.setDate(0);
    }
    fechaFinDate.setHours(23, 59, 59, 999);

    const suscripcionActiva = SuscripcionesDB.findFirst({
      socioId,
      activa: true,
    });

    if (suscripcionActiva) {
      SuscripcionesDB.update({ id: suscripcionActiva.id }, {
        planId,
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        activa: true,
      });
    } else {
      const suscripcionInactiva = SuscripcionesDB.findFirst({
        socioId,
        planId,
        activa: false,
      });
      if (suscripcionInactiva) {
        SuscripcionesDB.update({ id: suscripcionInactiva.id }, {
          fechaInicio: fechaInicioDate,
          fechaFin: fechaFinDate,
          activa: true,
        });
      } else {
        SuscripcionesDB.create({
          socioId,
          planId,
          fechaInicio: fechaInicioDate,
          fechaFin: fechaFinDate,
          activa: true,
        });
      }
    }
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
    SuscripcionesDB.update({ id }, { activa: false });
    revalidatePath('/admin/suscripciones');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error de base de datos: No se pudo cancelar la suscripción.');
  }
}

const UpdateSuscripcionSchema = z.object({
  fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fechaFin: z.string().min(1, 'La fecha de fin es obligatoria'),
});

export async function updateSuscripcion(id: string, prevState: unknown, formData: FormData) {
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
    fechaFinDate.setHours(23, 59, 59, 999);

    SuscripcionesDB.update({ id }, {
      fechaInicio: fechaInicioDate,
      fechaFin: fechaFinDate,
    });
  } catch {
    return {
      message: 'Error de base de datos: No se pudo actualizar la suscripción.',
    };
  }

  revalidatePath('/admin/suscripciones');
  redirect('/admin/suscripciones');
}
