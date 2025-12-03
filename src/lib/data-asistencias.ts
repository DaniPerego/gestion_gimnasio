import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchAsistencias(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const asistencias = await prisma.asistencia.findMany({
      skip: offset,
      take: ITEMS_PER_PAGE,
      where: {
        OR: [
          { socio: { nombre: { contains: query } } },
          { socio: { apellido: { contains: query } } },
          { socio: { dni: { contains: query } } },
        ],
      },
      include: {
        socio: true,
      },
      orderBy: {
        fecha: 'desc',
      },
    });
    return asistencias;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch attendance records.');
  }
}

export async function fetchAsistenciasPages(query: string) {
  noStore();
  try {
    const count = await prisma.asistencia.count({
      where: {
        OR: [
          { socio: { nombre: { contains: query } } },
          { socio: { apellido: { contains: query } } },
          { socio: { dni: { contains: query } } },
        ],
      },
    });
    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of attendance pages.');
  }
}
