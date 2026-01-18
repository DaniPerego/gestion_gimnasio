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
  contactoEmergencia: z.string().min(1, 'El contacto de emergencia es obligatorio'),
  condicionesMedicas: z.string().min(1, 'Las condiciones médicas son obligatorias'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  genero: z.string().optional(),
  direccion: z.string().optional(),
  telefonoEmergencia: z.string().optional(),
  objetivo: z.string().optional(),
  esLibre: z.boolean().optional(),
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
    fechaNacimiento: formData.get('fechaNacimiento'),
    genero: formData.get('genero'),
    direccion: formData.get('direccion'),
    contactoEmergencia: formData.get('contactoEmergencia'),
    telefonoEmergencia: formData.get('telefonoEmergencia'),
    condicionesMedicas: formData.get('condicionesMedicas'),
    objetivo: formData.get('objetivo'),
    esLibre: formData.get('esLibre') === 'on',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios. Error al crear socio.',
      values: Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [
          key, value.toString()
        ])
      ),
    };
  }

  const { 
    nombre, apellido, dni, email, telefono,
    fechaNacimiento, genero, direccion, contactoEmergencia, telefonoEmergencia, condicionesMedicas, objetivo, esLibre
  } = validatedFields.data;

  try {
    await prisma.socio.create({
      data: {
        nombre,
        apellido,
        dni,
        email: email || null,
        telefono: telefono || null,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        genero: genero || null,
        direccion: direccion || null,
        contactoEmergencia: contactoEmergencia || null,
        telefonoEmergencia: telefonoEmergencia || null,
        condicionesMedicas: condicionesMedicas || null,
        objetivo: objetivo || null,
        esLibre: esLibre ?? false,
      },
    });
  } catch {
    return {
      message: 'Error de base de datos: No se pudo crear el socio (posible DNI duplicado).',
      errors: {},
      values: Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [
          key, value.toString()
        ])
      ),
    };
  }

  // En caso de éxito, redirigir
  revalidatePath('/admin/socios');
  redirect('/admin/socios');

}

export async function updateSocio(id: string, prevState: unknown, formData: FormData) {
    const validatedFields = UpdateSocio.safeParse({
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      dni: formData.get('dni'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      fechaNacimiento: formData.get('fechaNacimiento'),
      genero: formData.get('genero'),
      direccion: formData.get('direccion'),
      contactoEmergencia: formData.get('contactoEmergencia'),
      telefonoEmergencia: formData.get('telefonoEmergencia'),
      condicionesMedicas: formData.get('condicionesMedicas'),
      objetivo: formData.get('objetivo'),
      esLibre: formData.get('esLibre') === 'on',
    });
  
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Faltan campos obligatorios. Error al actualizar socio.',
      };
    }
  
    const { 
      nombre, apellido, dni, email, telefono,
      fechaNacimiento, genero, direccion, contactoEmergencia, telefonoEmergencia, condicionesMedicas, objetivo, esLibre
    } = validatedFields.data;
  
    try {
      await prisma.socio.update({
        where: { id },
        data: {
          nombre,
          apellido,
          dni,
          email: email || null,
          telefono: telefono || null,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
          genero: genero || null,
          direccion: direccion || null,
          contactoEmergencia: contactoEmergencia || null,
          telefonoEmergencia: telefonoEmergencia || null,
          condicionesMedicas: condicionesMedicas || null,
          objetivo: objetivo || null,
          esLibre: esLibre ?? false,
        },
      });
    } catch {
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
