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
    estadoSuscripcion: 'ACTIVA' | 'VENCIDA' | 'SIN_SUSCRIPCION' | 'PERSUADIDO';
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

    // 2. Verificar estado de suscripción (Lógica Mes Calendario)
    let estadoSuscripcion: 'ACTIVA' | 'VENCIDA' | 'SIN_SUSCRIPCION' | 'PERSUADIDO' = 'SIN_SUSCRIPCION';
    let diasVencimiento = 0;
    const now = new Date();
    const currentDay = now.getDate();

    // Buscar suscripción activa que cubra la fecha actual
    const suscripcionActiva = socio.suscripciones.find(s => {
        const fechaFin = new Date(s.fechaFin);
        // Ajustar fechaFin al final del día para comparación justa
        fechaFin.setHours(23, 59, 59, 999);
        return fechaFin >= now;
    });

    if (suscripcionActiva) {
        estadoSuscripcion = 'ACTIVA';
        const fechaFin = new Date(suscripcionActiva.fechaFin);
        const diffTime = fechaFin.getTime() - now.getTime();
        diasVencimiento = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
        // Si no tiene suscripción vigente, aplicamos lógica de días del mes
        if (currentDay <= 10) {
            estadoSuscripcion = 'ACTIVA'; // Periodo de gracia / pago
        } else if (currentDay <= 15) {
            estadoSuscripcion = 'PERSUADIDO'; // Alerta naranja
        } else {
            estadoSuscripcion = 'VENCIDA'; // Alerta roja
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
      message = 'ALERTA: Cuota Vencida / Suspendida.';
      status = 'error'; // Rojo
    } else if (estadoSuscripcion === 'PERSUADIDO') {
      message = 'ALERTA: Cuota por vencer (Persuasión).';
      status = 'warning'; // Naranja
    } else if (estadoSuscripcion === 'ACTIVA' && !suscripcionActiva) {
        message = 'Socio Activo (Periodo de pago 1-10).';
        status = 'success';
    } else {
        message = 'Socio Activo (Cuota al día).';
        status = 'success';
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
