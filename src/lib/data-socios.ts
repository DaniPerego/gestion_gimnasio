import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchFilteredSocios(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const socios = await prisma.socio.findMany({
      where: {
        OR: [
          { nombre: { contains: query } },
          { apellido: { contains: query } },
          { dni: { contains: query } },
          { email: { contains: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });
    return socios;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener los socios.');
  }
}

export async function fetchSociosPages(query: string) {
  noStore();
  try {
    const count = await prisma.socio.count({
      where: {
        OR: [
          { nombre: { contains: query } },
          { apellido: { contains: query } },
          { dni: { contains: query } },
          { email: { contains: query } },
        ],
      },
    });
    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al contar los socios.');
  }
}

export async function fetchAllSocios() {
  noStore();
  try {
    const socios = await prisma.socio.findMany({
      where: { activo: true },
      orderBy: { apellido: 'asc' },
    });
    return socios;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener todos los socios.');
  }
}
