import { NextRequest, NextResponse } from 'next/server';
import { AsistenciasDB, SociosDB, SuscripcionesDB, PlanesDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const discipline = searchParams.get('discipline');

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

    return NextResponse.json(asistencias);
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    return NextResponse.json({ error: 'Error al obtener asistencias' }, { status: 500 });
  }
}
