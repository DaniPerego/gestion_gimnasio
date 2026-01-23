import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchSocioById(id: string) {
  noStore();
  try {
    const socio = await prisma.socio.findUnique({
      where: { id },
      include: {
        cuentaCorriente: {
          include: {
            movimientos: {
              orderBy: { createdAt: 'desc' },
              take: 10, // Últimos 10 movimientos
            },
          },
        },
      },
    });
    return socio;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener el socio.');
  }
}
