'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ConfigSchema = z.object({
  nombreGimnasio: z.string().min(1, 'El nombre es obligatorio'),
  colorPrimario: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Color inválido (Hex)'),
  colorSecundario: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Color inválido (Hex)'),
});

export async function updateConfiguracion(prevState: any, formData: FormData) {
  const validatedFields = ConfigSchema.safeParse({
    nombreGimnasio: formData.get('nombreGimnasio'),
    colorPrimario: formData.get('colorPrimario'),
    colorSecundario: formData.get('colorSecundario'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios o formato inválido.',
    };
  }

  const { nombreGimnasio, colorPrimario, colorSecundario } = validatedFields.data;

  try {
    // Buscamos la primera configuración existente para actualizarla
    const existingConfig = await prisma.configuracion.findFirst();

    if (existingConfig) {
      await prisma.configuracion.update({
        where: { id: existingConfig.id },
        data: {
          nombreGimnasio,
          colorPrimario,
          colorSecundario,
        },
      });
    } else {
      // Si por alguna razón no existe, la creamos
      await prisma.configuracion.create({
        data: {
          nombreGimnasio,
          colorPrimario,
          colorSecundario,
        },
      });
    }
  } catch (error) {
    return {
      message: 'Error de base de datos: No se pudo actualizar la configuración.',
    };
  }

  revalidatePath('/admin'); // Revalidar todo el layout admin
  return { message: 'Configuración actualizada correctamente.', errors: {} };
}
