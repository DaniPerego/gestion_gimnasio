'use server';

import { z } from 'zod';
import { PlanesDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const PlanSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  precio: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  duracionMeses: z.coerce.number().int().min(1, 'La duración debe ser al menos 1'),
  allowsMusculacion: z.coerce.boolean(),
  allowsCrossfit: z.coerce.boolean(),
});

const CreatePlan = PlanSchema.omit({ id: true });
const UpdatePlan = PlanSchema.omit({ id: true });

export async function createPlan(prevState: unknown, formData: FormData) {
  const validatedFields = CreatePlan.safeParse({
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    precio: formData.get('precio'),
    duracionMeses: formData.get('duracionMeses'),
    allowsMusculacion: formData.get('allowsMusculacion') === 'on',
    allowsCrossfit: formData.get('allowsCrossfit') === 'on',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios. Error al crear plan.',
    };
  }

  const { nombre, descripcion, precio, duracionMeses, allowsMusculacion, allowsCrossfit } = validatedFields.data;

  try {
    PlanesDB.create({
      nombre,
      descripcion: descripcion || null,
      precio,
      duracionMeses,
      activo: true,
      allowsMusculacion,
      allowsCrossfit,
    });
  } catch {
    return {
      message: 'Error de base de datos: No se pudo crear el plan.',
    };
  }

  revalidatePath('/admin/planes');
  redirect('/admin/planes');
}

export async function updatePlan(id: string, prevState: unknown, formData: FormData) {
  const validatedFields = UpdatePlan.safeParse({
    nombre: formData.get('nombre'),
    descripcion: formData.get('descripcion'),
    precio: formData.get('precio'),
    duracionMeses: formData.get('duracionMeses'),
    allowsMusculacion: formData.get('allowsMusculacion') === 'on',
    allowsCrossfit: formData.get('allowsCrossfit') === 'on',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios. Error al actualizar plan.',
    };
  }

  const { nombre, descripcion, precio, duracionMeses, allowsMusculacion, allowsCrossfit } = validatedFields.data;

  try {
    PlanesDB.update({ id }, {
      nombre,
      descripcion: descripcion || null,
      precio,
      duracionMeses,
      allowsMusculacion,
      allowsCrossfit,
    });
  } catch {
    return { message: 'Error de base de datos: No se pudo actualizar el plan.' };
  }

  revalidatePath('/admin/planes');
  redirect('/admin/planes');
}

export async function deletePlan(id: string) {
  try {
    PlanesDB.delete({ id });
    revalidatePath('/admin/planes');
  } catch (error) {
    console.error('Error deleting plan:', error);
  }
}
