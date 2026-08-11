'use server';

import { z } from 'zod';
import { ConfiguracionDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const ConfigSchema = z.object({
  nombreGimnasio: z.string().min(1, 'El nombre es obligatorio'),
  colorPrimario: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Color inválido (Hex)'),
  colorSecundario: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Color inválido (Hex)'),
  fondoUrl: z.string().optional(),
});

export async function updateConfiguracion(prevState: unknown, formData: FormData) {
  const validatedFields = ConfigSchema.safeParse({
    nombreGimnasio: formData.get('nombreGimnasio'),
    colorPrimario: formData.get('colorPrimario'),
    colorSecundario: formData.get('colorSecundario'),
    fondoUrl: formData.get('fondoUrl'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios o formato inválido.',
    };
  }

  const { nombreGimnasio, colorPrimario, colorSecundario, fondoUrl } = validatedFields.data;

  try {
    const existingConfig = ConfiguracionDB.findFirst();

    if (existingConfig) {
      ConfiguracionDB.update({ id: existingConfig.id }, {
        nombreGimnasio,
        colorPrimario,
        colorSecundario,
        fondoUrl: fondoUrl || null,
      });
    } else {
      ConfiguracionDB.create({
        nombreGimnasio,
        colorPrimario,
        colorSecundario,
        logoUrl: null,
        fondoUrl: fondoUrl || null,
      });
    }
  } catch {
    return {
      message: 'Error de base de datos: No se pudo actualizar la configuración.',
    };
  }

  revalidatePath('/admin');
  return { message: 'Configuración actualizada correctamente.', errors: {} };
}
