'use server';

import { z } from 'zod';
import { AsistenciasDB, SociosDB, SuscripcionesDB, PlanesDB } from '@/lib/db';
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
    const socio = SociosDB.findUnique({ dni });
    if (!socio) {
      return {
        message: 'Socio no encontrado.',
        status: 'error',
      };
    }

    // 2. Verificar estado de suscripción
    let estadoSuscripcion: 'ACTIVA' | 'VENCIDA' | 'SIN_SUSCRIPCION' | 'PERSUADIDO' = 'SIN_SUSCRIPCION';
    let diasVencimiento = 0;
    let mensajeEstado = '';
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (socio.esLibre) {
        estadoSuscripcion = 'ACTIVA';
        mensajeEstado = 'Socio Libre - Acceso Permitido';
    } else {
        const suscripciones = SuscripcionesDB.findMany({ where: {} })
          .filter(s => s.socioId === socio.id && s.activa)
          .sort((a, b) => new Date(b.fechaFin).getTime() - new Date(a.fechaFin).getTime());
        
        const ultimaSuscripcion = suscripciones[0];

        if (ultimaSuscripcion) {
            const fechaFin = new Date(ultimaSuscripcion.fechaFin);
            fechaFin.setHours(0, 0, 0, 0);

            const diffTime = fechaFin.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0) {
                diasVencimiento = diffDays;
                
                if (diffDays <= 5 && diffDays > 0) {
                    estadoSuscripcion = 'PERSUADIDO';
                    mensajeEstado = `Su cuota vence en ${diffDays} día${diffDays === 1 ? '' : 's'}. Regularice su situación pronto.`;
                } else if (diffDays === 0) {
                    estadoSuscripcion = 'PERSUADIDO';
                    mensajeEstado = 'Su cuota vence hoy. Regularice su situación con la administración.';
                } else {
                    estadoSuscripcion = 'ACTIVA';
                    mensajeEstado = 'Bienvenido/a';
                }
            } else {
                const diasVencidos = Math.abs(diffDays);
                diasVencimiento = -diasVencidos;

                estadoSuscripcion = 'VENCIDA';
                mensajeEstado = `Su cuota venció hace ${diasVencidos} día${diasVencidos === 1 ? '' : 's'}. Diríjase a la administración para regularizar su situación.`;
            }
        } else {
            estadoSuscripcion = 'SIN_SUSCRIPCION';
            mensajeEstado = 'No posee suscripción activa.';
        }
    }

    // 3. Registrar asistencia y Retornar Resultado
    if (estadoSuscripcion === 'ACTIVA' || estadoSuscripcion === 'PERSUADIDO') {
      AsistenciasDB.create({
        socioId: socio.id,
        fecha: new Date(),
      });

      revalidatePath('/admin'); 
      revalidatePath('/admin/asistencias');

      let statusResponse: 'success' | 'warning' | 'error' = 'success';
      
      if (estadoSuscripcion === 'PERSUADIDO') {
        statusResponse = 'warning';
      } else {
        statusResponse = 'success';
      }

      return {
        message: mensajeEstado,
        status: statusResponse,
        socio: {
          nombre: socio.nombre,
          apellido: socio.apellido,
          telefono: socio.telefono,
          estadoSuscripcion,
          diasVencimiento,
        },
      };
    } else {
      return {
        message: mensajeEstado,
        status: 'error',
        socio: {
          nombre: socio.nombre,
          apellido: socio.apellido,
          telefono: socio.telefono,
          estadoSuscripcion,
          diasVencimiento,
        },
      };
    }

  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    return {
      message: 'Error de base de datos.',
      status: 'error',
    };
  }
}
