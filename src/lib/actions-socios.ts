'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  dni: z.string().min(1, 'El DNI es obligatorio'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
});

const CreateSocio = FormSchema.omit({ id: true });
const UpdateSocio = FormSchema.omit({ id: true });

export async function createSocio(prevState: any, formData: FormData) {
  const validatedFields = CreateSocio.safeParse({
    nombre: formData.get('nombre'),
    apellido: formData.get('apellido'),
    dni: formData.get('dni'),
    email: formData.get('email'),
    telefono: formData.get('telefono'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios. Error al crear socio.',
    };
  }

  const { nombre, apellido, dni, email, telefono } = validatedFields.data;

  try {
    await prisma.socio.create({
      data: {
        nombre,
        apellido,
        dni,
        email: email || null,
        telefono: telefono || null,
      },
    });
  } catch (error) {
    return {
      message: 'Error de base de datos: No se pudo crear el socio (posible DNI duplicado).',
    };
  }

  revalidatePath('/admin/socios');
  redirect('/admin/socios');
}

export async function updateSocio(id: string, prevState: any, formData: FormData) {
    const validatedFields = UpdateSocio.safeParse({
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      dni: formData.get('dni'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
    });
  
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Faltan campos obligatorios. Error al actualizar socio.',
      };
    }
  
    const { nombre, apellido, dni, email, telefono } = validatedFields.data;
  
    try {
      await prisma.socio.update({
        where: { id },
        data: {
          nombre,
          apellido,
          dni,
          email: email || null,
          telefono: telefono || null,
        },
      });
    } catch (error) {
      return { message: 'Error de base de datos: No se pudo actualizar el socio.' };
    }
  
    revalidatePath('/admin/socios');
    redirect('/admin/socios');
  }

export async function deleteSocio(id: string) {
  try {
    await prisma.socio.delete({
      where: { id },
    });
    revalidatePath('/admin/socios');
  } catch (error) {
    console.error('Error deleting socio:', error);
  }
}
