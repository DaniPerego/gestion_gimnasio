import prisma from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchCardData() {
  noStore();

  try {
    // 1. Socios Activos
    const sociosCountPromise = prisma.socio.count({
      where: { activo: true },
    });

    // 2. Ingresos del Mes
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const incomePromise = prisma.transaccion.aggregate({
      _sum: {
        monto: true,
      },
      where: {
        fecha: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // 3. Vencimientos Próximos (Próximos 7 días)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const expiringPromise = prisma.suscripcion.count({
      where: {
        activa: true,
        fechaFin: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
    });

    // 4. Asistencias Hoy
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const attendancePromise = prisma.asistencia.count({
      where: {
        fecha: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const [sociosCount, incomeResult, expiringCount, attendanceCount] = await Promise.all([
      sociosCountPromise,
      incomePromise,
      expiringPromise,
      attendancePromise,
    ]);

    const totalIncome = Number(incomeResult._sum.monto) || 0;

    return {
      numberOfSocios: sociosCount,
      totalIncome,
      expiringSubscriptions: expiringCount,
      todaysAttendance: attendanceCount,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}
