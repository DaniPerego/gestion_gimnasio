import { UsuariosDB } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchUsuarios(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const usuarios = UsuariosDB.findMany({
      skip: offset,
      take: ITEMS_PER_PAGE,
      where: {
        OR: [
          { nombre: query },
          { email: query },
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
    const count = UsuariosDB.count({
      where: {
        OR: [
          { nombre: query },
          { email: query },
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
    const usuario = UsuariosDB.findUnique({ id });
    return usuario;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener el usuario.');
  }
}
