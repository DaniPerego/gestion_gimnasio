import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function getConfiguracion() {
  noStore(); // Evitar caché estático para que los cambios de config se reflejen
  try {
    // Obtenemos la primera configuración disponible (asumimos un solo tenant por ahora)
    const config = await prisma.configuracion.findFirst();
    return config;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener la configuración del sistema.');
  }
}
