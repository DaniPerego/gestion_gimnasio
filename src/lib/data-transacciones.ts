import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchTransacciones(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const transacciones = await prisma.transaccion.findMany({
      skip: offset,
      take: ITEMS_PER_PAGE,
      where: {
        OR: [
          { suscripcion: { socio: { nombre: { contains: query, mode: 'insensitive' } } } },
          { suscripcion: { socio: { apellido: { contains: query, mode: 'insensitive' } } } },
          { suscripcion: { socio: { dni: { contains: query, mode: 'insensitive' } } } },
        ],
      },
      include: {
        suscripcion: {
          include: {
            socio: true,
            plan: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });
    
    // Convertir Decimal a number para evitar error de serialización
    return transacciones.map(t => ({
      ...t,
      monto: Number(t.monto),
      suscripcion: {
        ...t.suscripcion,
        plan: {
          ...t.suscripcion.plan,
          precio: Number(t.suscripcion.plan.precio)
        }
      }
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch transactions.');
  }
}

export async function fetchTransaccionesPages(query: string) {
  noStore();
  try {
    const count = await prisma.transaccion.count({
      where: {
        OR: [
          { suscripcion: { socio: { nombre: { contains: query, mode: 'insensitive' } } } },
          { suscripcion: { socio: { apellido: { contains: query, mode: 'insensitive' } } } },
          { suscripcion: { socio: { dni: { contains: query, mode: 'insensitive' } } } },
        ],
      },
    });
    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of transactions.');
  }
}

export async function fetchActiveSuscripcionesForSelect() {
  noStore();
  try {
    const suscripciones = await prisma.suscripcion.findMany({
      where: { activa: true },
      include: {
        socio: {
          include: {
            cuentaCorriente: true,
          },
        },
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    // Convertir Decimal a number para evitar error de serialización
    return suscripciones.map(s => ({
      ...s,
      socio: {
        ...s.socio,
        cuentaCorriente: s.socio.cuentaCorriente ? {
          ...s.socio.cuentaCorriente,
          saldoDeuda: Number(s.socio.cuentaCorriente.saldoDeuda),
          saldoCredito: Number(s.socio.cuentaCorriente.saldoCredito),
        } : null,
      },
      plan: {
        ...s.plan,
        precio: Number(s.plan.precio)
      }
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch active subscriptions.');
  }
}
