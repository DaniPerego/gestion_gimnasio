import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchUsuarios(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const usuarios = await prisma.usuario.findMany({
      skip: offset,
      take: ITEMS_PER_PAGE,
      where: {
        OR: [
          { nombre: { contains: query } },
          { email: { contains: query } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return usuarios;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener los usuarios.');
  }
}

export async function fetchUsuariosPages(query: string) {
  noStore();
  try {
    const count = await prisma.usuario.count({
      where: {
        OR: [
          { nombre: { contains: query } },
          { email: { contains: query } },
        ],
      },
    });
    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al contar los usuarios.');
  }
}

export async function fetchUsuarioById(id: string) {
  noStore();
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });
    return usuario;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener el usuario.');
  }
}
