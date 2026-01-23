import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 15;

/**
 * Obtener todos los socios con paginación y búsqueda
 */
export async function fetchSociosConCuentaCorriente(
  query: string,
  currentPage: number,
  filtro?: string
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const whereCondition: any = {
      activo: true,
      OR: [
        { nombre: { contains: query, mode: 'insensitive' } },
        { apellido: { contains: query, mode: 'insensitive' } },
        { dni: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Filtros adicionales
    if (filtro === 'con-cuenta') {
      whereCondition.cuentaCorriente = { isNot: null };
    } else if (filtro === 'sin-cuenta') {
      whereCondition.cuentaCorriente = null;
    } else if (filtro === 'con-deuda') {
      whereCondition.cuentaCorriente = {
        saldoDeuda: { gt: 0 },
      };
    } else if (filtro === 'con-credito') {
      whereCondition.cuentaCorriente = {
        saldoCredito: { gt: 0 },
      };
    }

    const socios = await prisma.socio.findMany({
      where: whereCondition,
      include: {
        cuentaCorriente: true,
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' },
      ],
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    // Convertir Decimal a number
    return socios.map(s => ({
      ...s,
      cuentaCorriente: s.cuentaCorriente ? {
        ...s.cuentaCorriente,
        saldoDeuda: s.cuentaCorriente.saldoDeuda.toNumber(),
        saldoCredito: s.cuentaCorriente.saldoCredito.toNumber(),
      } : null,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener socios con cuenta corriente.');
  }
}

/**
 * Contar páginas para paginación
 */
export async function fetchSociosCuentaCorrientePages(query: string, filtro?: string) {
  noStore();
  try {
    const whereCondition: any = {
      activo: true,
      OR: [
        { nombre: { contains: query, mode: 'insensitive' } },
        { apellido: { contains: query, mode: 'insensitive' } },
        { dni: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filtro === 'con-cuenta') {
      whereCondition.cuentaCorriente = { isNot: null };
    } else if (filtro === 'sin-cuenta') {
      whereCondition.cuentaCorriente = null;
    } else if (filtro === 'con-deuda') {
      whereCondition.cuentaCorriente = {
        saldoDeuda: { gt: 0 },
      };
    } else if (filtro === 'con-credito') {
      whereCondition.cuentaCorriente = {
        saldoCredito: { gt: 0 },
      };
    }

    const count = await prisma.socio.count({
      where: whereCondition,
    });
    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al contar socios.');
  }
}

/**
 * Obtener un socio con su cuenta corriente completa
 */
export async function fetchSocioConCuentaCorriente(socioId: string) {
  noStore();
  try {
    const socio = await prisma.socio.findUnique({
      where: { id: socioId },
      include: {
        cuentaCorriente: {
          include: {
            movimientos: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!socio) return null;

    return {
      ...socio,
      cuentaCorriente: socio.cuentaCorriente ? {
        ...socio.cuentaCorriente,
        saldoDeuda: socio.cuentaCorriente.saldoDeuda.toNumber(),
        saldoCredito: socio.cuentaCorriente.saldoCredito.toNumber(),
        movimientos: socio.cuentaCorriente.movimientos.map(m => ({
          ...m,
          monto: m.monto.toNumber(),
        })),
      } : null,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener socio con cuenta corriente.');
  }
}
