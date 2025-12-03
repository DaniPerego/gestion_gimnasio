import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchSocioById(id: string) {
  noStore();
  try {
    const socio = await prisma.socio.findUnique({
      where: { id },
    });
    return socio;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener el socio.');
  }
}
