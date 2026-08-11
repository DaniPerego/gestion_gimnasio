import { SociosDB } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchFilteredSocios(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const socios = SociosDB.findMany({
      where: {
        OR: [
          { nombre: query },
          { apellido: query },
          { dni: query },
          { email: query },
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
    const count = SociosDB.count({
      where: {
        OR: [
          { nombre: query },
          { apellido: query },
          { dni: query },
          { email: query },
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
    const socios = SociosDB.findMany({
      where: { activo: true },
      orderBy: { apellido: 'asc' },
    });
    return socios;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener todos los socios.');
  }
}
