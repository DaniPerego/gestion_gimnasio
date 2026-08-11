'use server';

import { z } from 'zod';
import { SociosDB } from '@/lib/db';
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
    fechaNacimiento, genero, direccion, contactoEmergencia, telefonoEmergencia, condicionesMedicas, objetivo
  } = validatedFields.data;

  try {
    SociosDB.create({
      nombre,
      apellido,
      dni,
      email: email || null,
      telefono: telefono || null,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      genero: genero || null,
      direccion: direccion || null,
      fotoUrl: null,
      contactoEmergencia: contactoEmergencia || null,
      telefonoEmergencia: telefonoEmergencia || null,
      condicionesMedicas: condicionesMedicas || null,
      objetivo: objetivo || null,
      activo: true,
      esLibre: false,
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
    });
  
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Faltan campos obligatorios. Error al actualizar socio.',
      };
    }
  
    const { 
      nombre, apellido, dni, email, telefono,
      fechaNacimiento, genero, direccion, contactoEmergencia, telefonoEmergencia, condicionesMedicas, objetivo
    } = validatedFields.data;
  
    try {
      SociosDB.update({ id }, {
        nombre,
        apellido,
        dni,
        email: email || null,
        telefono: telefono || null,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        genero: genero || null,
        direccion: direccion || null,
        fotoUrl: null,
        contactoEmergencia: contactoEmergencia || null,
        telefonoEmergencia: telefonoEmergencia || null,
        condicionesMedicas: condicionesMedicas || null,
        objetivo: objetivo || null,
        esLibre: false,
      });
    } catch {
      return { message: 'Error de base de datos: No se pudo actualizar el socio.' };
    }

    revalidatePath('/admin/socios');
    redirect('/admin/socios');
  }

export async function deleteSocio(id: string) {
  try {
    SociosDB.delete({ id });
    revalidatePath('/admin/socios');
  } catch (error) {
    console.error('Error deleting socio:', error);
  }
}
