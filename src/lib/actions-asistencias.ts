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
  status?: 'success' | 'error' | 'warning'; 
  socio?: {
    nombre: string;
    apellido: string;
    telefono?: string | null;
    estadoSuscripcion: 'ACTIVA' | 'VENCIDA' | 'SIN_SUSCRIPCION';
    diasVencimiento?: number; 
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

    revalidatePath('/admin'); 
    revalidatePath('/admin/asistencias');

    let message = 'Asistencia registrada correctamente.';
    let status: 'success' | 'warning' | 'error' = 'success';

    if (estadoSuscripcion === 'VENCIDA') {
      message = 'ALERTA: La suscripción está VENCIDA.';
      status = 'error'; // Rojo
    } else if (estadoSuscripcion === 'SIN_SUSCRIPCION') {
      message = 'ALERTA: El socio NO tiene suscripción activa.';
      status = 'error'; // Rojo
    } else if (estadoSuscripcion === 'ACTIVA' && diasVencimiento <= 7) {
      message = `ATENCIÓN: La suscripción vence en ${diasVencimiento} días.`;
      status = 'warning'; // Naranja/Amarillo
    }

    return {
      message,
      status,
      socio: {
        nombre: socio.nombre,
        apellido: socio.apellido,
        telefono: socio.telefono,
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
