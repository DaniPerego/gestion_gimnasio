'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const CheckInSchema = z.object({
  dni: z.string().min(1, 'El DNI es obligatorio'),
});

export type CheckInState = {
  message?: string;
  errors?: {
    dni?: string[];
  };
  status?: 'success' | 'error' | 'warning'; // warning for expired subscription but allowed entry?
  socio?: {
    nombre: string;
    apellido: string;
    estadoSuscripcion: 'ACTIVA' | 'VENCIDA' | 'SIN_SUSCRIPCION';
    diasVencimiento?: number; // Days until expiration or days since expiration
  };
};

export async function registrarAsistencia(prevState: CheckInState, formData: FormData): Promise<CheckInState> {
  const validatedFields = CheckInSchema.safeParse({
    dni: formData.get('dni'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Por favor ingrese un DNI válido.',
      status: 'error',
    };
  }

  const { dni } = validatedFields.data;

  try {
    // 1. Buscar al socio
    const socio = await prisma.socio.findUnique({
      where: { dni },
      include: {
        suscripciones: {
          where: {
            activa: true,
          },
          orderBy: {
            fechaFin: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!socio) {
      return {
        message: 'Socio no encontrado.',
        status: 'error',
      };
    }

    // 2. Verificar estado de suscripción
    let estadoSuscripcion: 'ACTIVA' | 'VENCIDA' | 'SIN_SUSCRIPCION' = 'SIN_SUSCRIPCION';
    let diasVencimiento = 0;

    if (socio.suscripciones.length > 0) {
      const suscripcion = socio.suscripciones[0];
      const now = new Date();
      const fechaFin = new Date(suscripcion.fechaFin);
      
      // Calculate difference in days
      const diffTime = fechaFin.getTime() - now.getTime();
      diasVencimiento = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (fechaFin >= now) {
        estadoSuscripcion = 'ACTIVA';
      } else {
        estadoSuscripcion = 'VENCIDA';
      }
    }

    // 3. Registrar asistencia
    await prisma.asistencia.create({
      data: {
        socioId: socio.id,
      },
    });

    revalidatePath('/admin'); // Update dashboard attendance count
    revalidatePath('/admin/asistencias');

    let message = 'Asistencia registrada correctamente.';
    let status: 'success' | 'warning' = 'success';

    if (estadoSuscripcion === 'VENCIDA') {
      message = 'Asistencia registrada, pero la suscripción está VENCIDA.';
      status = 'warning';
    } else if (estadoSuscripcion === 'SIN_SUSCRIPCION') {
      message = 'Asistencia registrada, pero NO tiene suscripción activa.';
      status = 'warning';
    }

    return {
      message,
      status,
      socio: {
        nombre: socio.nombre,
        apellido: socio.apellido,
        estadoSuscripcion,
        diasVencimiento,
      },
    };

  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    return {
      message: 'Error de base de datos.',
      status: 'error',
    };
  }
}
