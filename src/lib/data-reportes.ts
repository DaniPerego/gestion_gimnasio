import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchIngresosPorMes() {
  noStore();
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const transacciones = await prisma.transaccion.findMany({
      where: {
        fecha: {
          gte: oneYearAgo,
        },
      },
      select: {
        fecha: true,
        monto: true,
      },
      orderBy: {
        fecha: 'asc',
      },
    });

    // Agrupar por mes y año
    const ingresosPorMes: Record<string, number> = {};

    transacciones.forEach((t) => {
      const date = new Date(t.fecha);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!ingresosPorMes[key]) {
        ingresosPorMes[key] = 0;
      }
      ingresosPorMes[key] += Number(t.monto);
    });

    // Convertir a array para el frontend
    return Object.entries(ingresosPorMes).map(([fecha, monto]) => ({
      fecha, // YYYY-MM
      monto,
    }));

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener reporte de ingresos.');
  }
}

export async function fetchNuevosSociosPorMes() {
  noStore();
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const socios = await prisma.socio.findMany({
      where: {
        createdAt: {
          gte: oneYearAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const sociosPorMes: Record<string, number> = {};

    socios.forEach((s) => {
      const date = new Date(s.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!sociosPorMes[key]) {
        sociosPorMes[key] = 0;
      }
      sociosPorMes[key] += 1;
    });

    return Object.entries(sociosPorMes).map(([fecha, cantidad]) => ({
      fecha,
      cantidad,
    }));

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener reporte de socios.');
  }
}
