'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

const FormSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre es obligatorio.'),
  email: z.string().email('Email inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  rol: z.string().min(1, 'El rol es obligatorio.'),
  permisoSocios: z.string().optional().nullable(),
  permisoPlanes: z.string().optional().nullable(),
  permisoSuscripciones: z.string().optional().nullable(),
  permisoAsistencias: z.string().optional().nullable(),
  permisoReportes: z.string().optional().nullable(),
  permisoConfiguracion: z.string().optional().nullable(),
  permisoUsuarios: z.string().optional().nullable(),
});

const CreateUsuario = FormSchema.omit({ id: true });
const UpdateUsuario = FormSchema.omit({ id: true, password: true }).extend({
  password: z.string().optional(),
});

export async function createUsuario(prevState: any, formData: FormData) {
  const validatedFields = CreateUsuario.safeParse({
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    password: formData.get('password'),
    rol: formData.get('rol'),
    permisoSocios: formData.get('permisoSocios'),
    permisoPlanes: formData.get('permisoPlanes'),
    permisoSuscripciones: formData.get('permisoSuscripciones'),
    permisoAsistencias: formData.get('permisoAsistencias'),
    permisoReportes: formData.get('permisoReportes'),
    permisoConfiguracion: formData.get('permisoConfiguracion'),
    permisoUsuarios: formData.get('permisoUsuarios'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos. No se pudo crear el usuario.',
    };
  }

  const { nombre, email, password, rol, permisoSocios, permisoPlanes, permisoSuscripciones, permisoAsistencias, permisoReportes, permisoConfiguracion, permisoUsuarios } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol,
        permisoSocios: permisoSocios === 'on',
        permisoPlanes: permisoPlanes === 'on',
        permisoSuscripciones: permisoSuscripciones === 'on',
        permisoAsistencias: permisoAsistencias === 'on',
        permisoReportes: permisoReportes === 'on',
        permisoConfiguracion: permisoConfiguracion === 'on',
        permisoUsuarios: permisoUsuarios === 'on',
      },
    });
  } catch (error) {
    return {
      message: 'Error de base de datos: No se pudo crear el usuario. El email podría estar duplicado.',
    };
  }

  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios');
}

export async function updateUsuario(id: string, prevState: any, formData: FormData) {
  const passwordRaw = formData.get('password') as string;
  
  // Si la contraseña está vacía, no la validamos ni la actualizamos
  const dataToValidate = {
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    rol: formData.get('rol'),
    permisoSocios: formData.get('permisoSocios'),
    permisoPlanes: formData.get('permisoPlanes'),
    permisoSuscripciones: formData.get('permisoSuscripciones'),
    permisoAsistencias: formData.get('permisoAsistencias'),
    permisoReportes: formData.get('permisoReportes'),
    permisoConfiguracion: formData.get('permisoConfiguracion'),
    permisoUsuarios: formData.get('permisoUsuarios'),
    ...(passwordRaw ? { password: passwordRaw } : {}),
  };

  // Usamos un esquema dinámico dependiendo de si hay password o no
  const schema = passwordRaw 
    ? UpdateUsuario.extend({ password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.') })
    : UpdateUsuario;

  const validatedFields = schema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos. No se pudo actualizar el usuario.',
    };
  }

  const { nombre, email, rol, password, permisoSocios, permisoPlanes, permisoSuscripciones, permisoAsistencias, permisoReportes, permisoConfiguracion, permisoUsuarios } = validatedFields.data;

  const dataToUpdate: any = {
    nombre,
    email,
    rol,
    permisoSocios: permisoSocios === 'on',
    permisoPlanes: permisoPlanes === 'on',
    permisoSuscripciones: permisoSuscripciones === 'on',
    permisoAsistencias: permisoAsistencias === 'on',
    permisoReportes: permisoReportes === 'on',
    permisoConfiguracion: permisoConfiguracion === 'on',
    permisoUsuarios: permisoUsuarios === 'on',
  };

  if (password) {
    dataToUpdate.password = await bcrypt.hash(password, 10);
  }

  try {
    await prisma.usuario.update({
      where: { id },
      data: dataToUpdate,
    });
  } catch (error) {
    return { message: 'Error de base de datos: No se pudo actualizar el usuario.' };
  }

  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios');
}

export async function deleteUsuario(id: string) {
  try {
    await prisma.usuario.delete({
      where: { id },
    });
    revalidatePath('/admin/usuarios');
  } catch (error) {
    console.error('Error deleting usuario:', error);
  }
}
