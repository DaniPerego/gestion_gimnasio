import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchFilteredSocios(
  query: string, 
  currentPage: number,
  estado?: string
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const whereCondition: any = {
      OR: [
        { nombre: { contains: query } },
        { apellido: { contains: query } },
        { dni: { contains: query } },
        { email: { contains: query } },
      ],
    };

    // Agregar filtro por estado
    if (estado === 'activo') {
      whereCondition.activo = true;
    } else if (estado === 'inactivo') {
      whereCondition.activo = false;
    }

    const socios = await prisma.socio.findMany({
      where: whereCondition,
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

export async function fetchSociosPages(query: string, estado?: string) {
  noStore();
  try {
    const whereCondition: any = {
      OR: [
        { nombre: { contains: query } },
        { apellido: { contains: query } },
        { dni: { contains: query } },
        { email: { contains: query } },
      ],
    };

    // Agregar filtro por estado
    if (estado === 'activo') {
      whereCondition.activo = true;
    } else if (estado === 'inactivo') {
      whereCondition.activo = false;
    }

    const count = await prisma.socio.count({
      where: whereCondition,
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
