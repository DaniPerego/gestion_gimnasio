import { SociosDB, TransaccionesDB, SuscripcionesDB, AsistenciasDB } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchCardData() {
  noStore();

  try {
    const socios = SociosDB.findMany({ where: { activo: true } });
    const sociosCount = socios.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transacciones = TransaccionesDB.findMany({ where: {} });
    const monthlyIncome = transacciones
      .filter(t => {
        const fecha = new Date(t.fecha);
        return fecha >= startOfMonth && fecha <= endOfMonth;
      })
      .reduce((sum, t) => sum + Number(t.monto), 0);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const suscripciones = SuscripcionesDB.findMany({ where: {} });
    const expiringCount = suscripciones.filter(s => {
      if (!s.activa) return false;
      const fechaFin = new Date(s.fechaFin);
      return fechaFin >= now && fechaFin <= sevenDaysFromNow;
    }).length;

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const asistencias = AsistenciasDB.findMany({ where: {} });
    const attendanceCount = asistencias.filter(a => {
      const fecha = new Date(a.fecha);
      return fecha >= startOfDay && fecha < endOfDay;
    }).length;

    return {
      numberOfSocios: sociosCount,
      totalIncome: monthlyIncome,
      expiringSubscriptions: expiringCount,
      todaysAttendance: attendanceCount,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}
