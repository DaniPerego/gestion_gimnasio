import { SuscripcionesDB } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

function contarCuotasVencidas(fechaFin: Date, duracionMeses: number, now: Date) {
  if (fechaFin >= now) return 0;

  const stepMonths = Math.max(duracionMeses, 1);
  let vencidas = 0;
  let proximoVencimiento = new Date(fechaFin);

  while (proximoVencimiento < now) {
    vencidas += 1;
    proximoVencimiento = new Date(proximoVencimiento);
    proximoVencimiento.setMonth(proximoVencimiento.getMonth() + stepMonths);

    if (vencidas > 120) break;
  }

  return vencidas;
}

function aplicarFiltroSuscripciones(suscripciones: any[], filtro?: string, now = new Date()) {
  return suscripciones.filter((suscripcion) => {
    const fechaFin = new Date(suscripcion.fechaFin);
    const isExpired = fechaFin < now;
    const cuotasVencidas = contarCuotasVencidas(fechaFin, suscripcion.plan?.duracionMeses || 1, now);

    if (filtro === 'vencidas') {
      return isExpired;
    }

    if (filtro === 'por-vencer') {
      const next7Days = new Date(now);
      next7Days.setDate(next7Days.getDate() + 7);
      return fechaFin >= now && fechaFin <= next7Days;
    }

    if (filtro === 'vencidas-mas') {
      return isExpired && cuotasVencidas > 1;
    }

    return true;
  });
}

export async function fetchSuscripciones(query: string, currentPage: number, filtro?: string) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const now = new Date();

  const whereCondition: any = {
    OR: [
      { socio: { nombre: query } },
      { socio: { apellido: query } },
      { socio: { dni: query } },
    ],
  };

  if (filtro === 'vencidas' || filtro === 'vencidas-mas') {
    whereCondition.fechaFin = { lt: now };
  } else if (filtro === 'por-vencer') {
    const next7Days = new Date(now);
    next7Days.setDate(next7Days.getDate() + 7);
    whereCondition.fechaFin = { gte: now, lte: next7Days };
  }

  try {
    const suscripciones = SuscripcionesDB.findMany({
      where: whereCondition,
      include: {
        socio: true,
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const filtradas = aplicarFiltroSuscripciones(suscripciones, filtro, now);
    const paginadas = filtradas.slice(offset, offset + ITEMS_PER_PAGE);
    
    return paginadas.map(s => ({
      ...s,
      fechaFin: new Date(s.fechaFin),
      fechaInicio: new Date(s.fechaInicio),
      cuotasVencidas: contarCuotasVencidas(new Date(s.fechaFin), s.plan?.duracionMeses || 1, now),
      plan: {
        ...s.plan,
        precio: Number(s.plan?.precio || 0)
      }
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener suscripciones.');
  }
}

export async function fetchSuscripcionesPages(query: string, filtro?: string) {
  noStore();
  const now = new Date();

  const whereCondition: any = {
    OR: [
      { socio: { nombre: query } },
      { socio: { apellido: query } },
      { socio: { dni: query } },
    ],
  };

  if (filtro === 'vencidas' || filtro === 'vencidas-mas') {
    whereCondition.fechaFin = { lt: now };
  } else if (filtro === 'por-vencer') {
    const next7Days = new Date(now);
    next7Days.setDate(next7Days.getDate() + 7);
    whereCondition.fechaFin = { gte: now, lte: next7Days };
  }

  try {
    const suscripciones = SuscripcionesDB.findMany({
      where: whereCondition,
      include: {
        plan: true,
      },
    });

    const filtradas = aplicarFiltroSuscripciones(suscripciones, filtro, now);
    return Math.ceil(filtradas.length / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener el total de suscripciones.');
  }
}

export async function fetchSuscripcionById(id: string) {
  noStore();
  try {
    const suscripcion = SuscripcionesDB.findUnique(
      { id },
      { socio: true, plan: true }
    );

    if (!suscripcion) return null;

    return {
      ...suscripcion,
      fechaFin: new Date(suscripcion.fechaFin),
      fechaInicio: new Date(suscripcion.fechaInicio),
      plan: {
        ...suscripcion.plan,
        precio: Number(suscripcion.plan?.precio || 0),
      },
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener la suscripción.');
  }
}
