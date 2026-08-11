import { AsistenciasDB, SociosDB, SuscripcionesDB, PlanesDB } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchAsistencias(query: string, currentPage: number, discipline?: string, date?: string) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const whereClause: any = {};

  if (date) {
    const startDate = new Date(`${date}T00:00:00-03:00`);
    const endDate = new Date(`${date}T23:59:59.999-03:00`);
    whereClause.fecha = {
      gte: startDate,
      lte: endDate,
    };
  }

  try {
    let asistencias = AsistenciasDB.findMany({
      where: whereClause,
      include: {},
      orderBy: { fecha: 'desc' },
    });

    // Enrich with socio data
    const socios = SociosDB.findMany();
    asistencias = asistencias.map(a => ({
      ...a,
      fecha: new Date(a.fecha),
      socio: socios.find(s => s.id === a.socioId) || null,
    })) as any[];

    // Filter by query
    if (query) {
      const q = query.toLowerCase();
      asistencias = asistencias.filter((a: any) => {
        const socio = a.socio;
        if (!socio) return false;
        return (
          socio.nombre?.toLowerCase().includes(q) ||
          socio.apellido?.toLowerCase().includes(q) ||
          socio.dni?.includes(q)
        );
      });
    }

    // Filter by discipline
    if (discipline) {
      const planes = PlanesDB.findMany();
      const subs = SuscripcionesDB.findMany({ where: {} });
      
      asistencias = asistencias.filter((a: any) => {
        const socioSubs = subs.filter(s => s.socioId === a.socioId && s.activa);
        return socioSubs.some(s => {
          const plan = planes.find(p => p.id === s.planId);
          if (!plan) return false;
          if (discipline === 'musculacion') return plan.allowsMusculacion;
          if (discipline === 'crossfit') return plan.allowsCrossfit;
          return true;
        });
      });
    }

    const paginated = asistencias.slice(offset, offset + ITEMS_PER_PAGE);
    return paginated as Array<{
      id: string;
      fecha: Date | string;
      socio: { id: string; nombre: string; apellido: string; dni: string } | null;
    }>;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch attendance records.');
  }
}

export async function fetchAsistenciasPages(query: string, discipline?: string, date?: string) {
  noStore();
  
  const whereClause: any = {};

  if (date) {
    const startDate = new Date(`${date}T00:00:00-03:00`);
    const endDate = new Date(`${date}T23:59:59.999-03:00`);
    whereClause.fecha = {
      gte: startDate,
      lte: endDate,
    };
  }

  try {
    let asistencias = AsistenciasDB.findMany({
      where: whereClause,
    });

    // Enrich with socio data
    const socios = SociosDB.findMany();
    asistencias = asistencias.map(a => ({
      ...a,
      socio: socios.find(s => s.id === a.socioId) || null,
    })) as any[];

    // Filter by query
    if (query) {
      const q = query.toLowerCase();
      asistencias = asistencias.filter((a: any) => {
        const socio = a.socio;
        if (!socio) return false;
        return (
          socio.nombre?.toLowerCase().includes(q) ||
          socio.apellido?.toLowerCase().includes(q) ||
          socio.dni?.includes(q)
        );
      });
    }

    // Filter by discipline
    if (discipline) {
      const planes = PlanesDB.findMany();
      const subs = SuscripcionesDB.findMany({ where: {} });
      
      asistencias = asistencias.filter((a: any) => {
        const socioSubs = subs.filter(s => s.socioId === a.socioId && s.activa);
        return socioSubs.some(s => {
          const plan = planes.find(p => p.id === s.planId);
          if (!plan) return false;
          if (discipline === 'musculacion') return plan.allowsMusculacion;
          if (discipline === 'crossfit') return plan.allowsCrossfit;
          return true;
        });
      });
    }

    return Math.ceil(asistencias.length / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of attendance pages.');
  }
}

export async function fetchAsistenciasHoy(discipline?: string) {
  noStore();
  const now = new Date();
  
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const cutoffDate = threeHoursAgo > todayStart ? threeHoursAgo : todayStart;

  try {
    let asistencias = AsistenciasDB.findMany({
      where: {
        fecha: {
          gte: cutoffDate,
        },
      },
    });

    // Enrich with socio and suscripciones
    const socios = SociosDB.findMany();
    const suscripciones = SuscripcionesDB.findMany({ where: {} });
    const planes = PlanesDB.findMany();

    asistencias = asistencias.map(a => {
      const socio = socios.find(s => s.id === a.socioId);
      const socioSubs = suscripciones
        .filter(s => s.socioId === a.socioId && s.activa)
        .map(s => ({
          ...s,
          plan: planes.find(p => p.id === s.planId),
        }));
      return {
        ...a,
        fecha: new Date(a.fecha),
        socio: socio ? {
          ...socio,
          suscripciones: socioSubs,
        } : null,
      };
    }) as any[];

    // Filter by discipline
    if (discipline) {
      asistencias = asistencias.filter((a: any) => {
        const subs = a.socio?.suscripciones || [];
        return subs.some((s: any) => {
          const plan = s.plan;
          if (!plan) return false;
          if (discipline === 'musculacion') return plan.allowsMusculacion;
          if (discipline === 'crossfit') return plan.allowsCrossfit;
          return true;
        });
      });
    }

    return asistencias;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch attendance records for today.');
  }
}
