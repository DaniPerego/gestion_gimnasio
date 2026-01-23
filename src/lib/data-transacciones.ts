import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchTransacciones(
  query: string, 
  currentPage: number,
  metodoPago?: string
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const whereCondition: any = {
      OR: [
        { suscripcion: { socio: { nombre: { contains: query, mode: 'insensitive' } } } },
        { suscripcion: { socio: { apellido: { contains: query, mode: 'insensitive' } } } },
        { suscripcion: { socio: { dni: { contains: query, mode: 'insensitive' } } } },
      ],
    };

    // Agregar filtro por método de pago
    if (metodoPago && metodoPago !== 'all') {
      whereCondition.metodoPago = metodoPago;
    }

    const transacciones = await prisma.transaccion.findMany({
      skip: offset,
      take: ITEMS_PER_PAGE,
      where: whereCondition,
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

export async function fetchTransaccionesPages(query: string, metodoPago?: string) {
  noStore();
  try {
    const whereCondition: any = {
      OR: [
        { suscripcion: { socio: { nombre: { contains: query, mode: 'insensitive' } } } },
        { suscripcion: { socio: { apellido: { contains: query, mode: 'insensitive' } } } },
        { suscripcion: { socio: { dni: { contains: query, mode: 'insensitive' } } } },
      ],
    };

    // Agregar filtro por método de pago
    if (metodoPago && metodoPago !== 'all') {
      whereCondition.metodoPago = metodoPago;
    }

    const count = await prisma.transaccion.count({
      where: whereCondition,
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
