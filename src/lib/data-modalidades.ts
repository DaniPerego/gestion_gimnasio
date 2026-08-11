import { AsistenciasDB, SociosDB } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchAsistenciasHoy(modalidadId?: string) {
  noStore();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  try {
    let asistencias = AsistenciasDB.findMany({
      where: {
        fecha: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    // Enrich with socio
    const socios = SociosDB.findMany();
    asistencias = asistencias.map(a => ({
      ...a,
      fecha: new Date(a.fecha),
      socio: socios.find(s => s.id === a.socioId) || null,
    })) as any[];

    // Sort by fecha asc
    asistencias.sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return asistencias;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch today attendance records.');
  }
}
