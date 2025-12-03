import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchPlanes() {
  noStore();
  try {
    const planes = await prisma.plan.findMany({
      orderBy: { precio: 'asc' },
    });
    return planes.map(plan => ({
      ...plan,
      precio: Number(plan.precio)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener los planes.');
  }
}

export async function fetchPlanById(id: string) {
  noStore();
  try {
    const plan = await prisma.plan.findUnique({
      where: { id },
    });
    
    if (!plan) return null;

    return {
      ...plan,
      precio: Number(plan.precio)
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener el plan.');
  }
}

export async function fetchActivePlanes() {
  noStore();
  try {
    const planes = await prisma.plan.findMany({
      where: { activo: true },
      orderBy: { precio: 'asc' },
    });
    // Convertir Decimal a number para evitar error de serialización en Client Components
    return planes.map(plan => ({
      ...plan,
      precio: Number(plan.precio)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener los planes activos.');
  }
}
