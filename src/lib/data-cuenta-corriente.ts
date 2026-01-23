import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Obtener todos los socios con sus cuentas corrientes
 */
export async function fetchSociosConCuentaCorriente() {
  noStore();
  try {
    const socios = await prisma.socio.findMany({
      where: { activo: true },
      include: {
        cuentaCorriente: {
          include: {
            movimientos: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
      },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' },
      ],
    });

    // Convertir Decimal a number
    return socios.map(s => ({
      ...s,
      cuentaCorriente: s.cuentaCorriente ? {
        ...s.cuentaCorriente,
        saldoDeuda: s.cuentaCorriente.saldoDeuda.toNumber(),
        saldoCredito: s.cuentaCorriente.saldoCredito.toNumber(),
        movimientos: s.cuentaCorriente.movimientos.map(m => ({
          ...m,
          monto: m.monto.toNumber(),
        })),
      } : null,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener socios con cuenta corriente.');
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
