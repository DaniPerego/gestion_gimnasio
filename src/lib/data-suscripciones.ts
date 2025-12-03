import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchSuscripciones(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const suscripciones = await prisma.suscripcion.findMany({
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
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Convertir Decimal a number para evitar error de serialización
    return suscripciones.map(s => ({
      ...s,
      plan: {
        ...s.plan,
        precio: Number(s.plan.precio)
      }
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch subscriptions.');
  }
}

export async function fetchSuscripcionesPages(query: string) {
  noStore();
  try {
    const count = await prisma.suscripcion.count({
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
    throw new Error('Failed to fetch total number of subscriptions.');
  }
}
