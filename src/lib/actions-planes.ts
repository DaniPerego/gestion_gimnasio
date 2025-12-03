'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const PlanSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  precio: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  duracionMeses: z.coerce.number().int().min(1, 'La duración debe ser al menos 1 mes'),
});

const CreatePlan = PlanSchema.omit({ id: true });
const UpdatePlan = PlanSchema.omit({ id: true });

export async function createPlan(prevState: any, formData: FormData) {
  const validatedFields = CreatePlan.safeParse({
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    precio: formData.get('precio'),
    duracionMeses: formData.get('duracionMeses'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios. Error al crear plan.',
    };
  }

  const { nombre, descripcion, precio, duracionMeses } = validatedFields.data;

  try {
    await prisma.plan.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        precio,
        duracionMeses,
      },
    });
  } catch (error) {
    return {
      message: 'Error de base de datos: No se pudo crear el plan.',
    };
  }

  revalidatePath('/admin/planes');
  redirect('/admin/planes');
}

export async function updatePlan(id: string, prevState: any, formData: FormData) {
  const validatedFields = UpdatePlan.safeParse({
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    precio: formData.get('precio'),
    duracionMeses: formData.get('duracionMeses'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios. Error al actualizar plan.',
    };
  }

  const { nombre, descripcion, precio, duracionMeses } = validatedFields.data;

  try {
    await prisma.plan.update({
      where: { id },
      data: {
        nombre,
        descripcion: descripcion || null,
        precio,
        duracionMeses,
      },
    });
  } catch (error) {
    return { message: 'Error de base de datos: No se pudo actualizar el plan.' };
  }

  revalidatePath('/admin/planes');
  redirect('/admin/planes');
}

export async function deletePlan(id: string) {
  try {
    await prisma.plan.delete({
      where: { id },
    });
    revalidatePath('/admin/planes');
  } catch (error) {
    console.error('Error deleting plan:', error);
  }
}
