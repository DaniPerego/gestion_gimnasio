import { TransaccionesDB, SociosDB, SuscripcionesDB, PlanesDB, AsistenciasDB } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

type HistorialPago = {
  id: string;
  fecha: Date;
  monto: number;
  metodoPago: string;
  notas: string;
  tipoPago: string;
  planNombre: string;
  suscripcionEstado: string;
  suscripcionFechaFin: Date;
};

type ResumenEstadoHistorial = {
  estado: string;
  cantidad: number;
  total: number;
};

function getEstadoSuscripcion(activa: boolean, fechaFin: Date, now: Date) {
  if (!activa) return 'Suspendida';
  return fechaFin < now ? 'Vencida' : 'Activa';
}

export async function fetchIngresosPorMes() {
  noStore();
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const transacciones = TransaccionesDB.findMany({
      where: {},
    });

    const filtered = transacciones.filter(t => new Date(t.fecha) >= oneYearAgo);

    const ingresosPorMes: Record<string, number> = {};

    filtered.forEach((t) => {
      const date = new Date(t.fecha);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!ingresosPorMes[key]) {
        ingresosPorMes[key] = 0;
      }
      ingresosPorMes[key] += Number(t.monto);
    });

    return Object.entries(ingresosPorMes).map(([fecha, monto]) => ({
      fecha,
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

    const socios = SociosDB.findMany();
    const filtered = socios.filter(s => new Date(s.createdAt) >= oneYearAgo);

    const sociosPorMes: Record<string, number> = {};

    filtered.forEach((s) => {
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

export async function fetchAsistenciasPorDia() {
  noStore();
  try {
    const treintaDiasAtras = new Date();
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

    const asistencias = AsistenciasDB.findMany({
      where: {
        fecha: {
          gte: treintaDiasAtras,
        },
      },
    });

    const asistenciasPorDia: Record<string, number> = {
      'Lunes': 0,
      'Martes': 0,
      'Miércoles': 0,
      'Jueves': 0,
      'Viernes': 0,
      'Sábado': 0,
      'Domingo': 0,
    };

    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    asistencias.forEach((a) => {
      const date = new Date(a.fecha);
      const diaSemana = diasSemana[date.getDay()];
      asistenciasPorDia[diaSemana]++;
    });

    return Object.entries(asistenciasPorDia).map(([dia, cantidad]) => ({
      dia,
      cantidad,
    }));

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener asistencias por día.');
  }
}

export async function fetchIngresosPorTipo() {
  noStore();
  try {
    const treintaDiasAtras = new Date();
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

    const transacciones = TransaccionesDB.findMany({
      where: {},
    });

    const filtered = transacciones.filter(t => new Date(t.fecha) >= treintaDiasAtras);

    let mensualidad = 0;
    let ventas = 0;

    filtered.forEach((t) => {
      const monto = Number(t.monto);
      const notas = (t.notas || '').toLowerCase();

      if (notas.includes('mensualidad') || notas.includes('plan') || notas.includes('suscripción')) {
        mensualidad += monto;
      } else if (notas.includes('bebida') || notas.includes('venta') || notas.includes('producto')) {
        ventas += monto;
      } else {
        mensualidad += monto;
      }
    });

    return [
      { tipo: 'Mensualidades', monto: mensualidad },
      { tipo: 'Ventas', monto: ventas },
    ];

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener ingresos por tipo.');
  }
}

export async function fetchIngresosPorDia(año: number, mes: number) {
  noStore();
  try {
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59, 999);

    const transacciones = TransaccionesDB.findMany({
      where: {},
    });

    const filtered = transacciones.filter(t => {
      const fecha = new Date(t.fecha);
      return fecha >= fechaInicio && fecha <= fechaFin;
    });

    const ingresosPorDia: Record<number, number> = {};

    filtered.forEach((t) => {
      const date = new Date(t.fecha);
      const dia = date.getDate();
      
      if (!ingresosPorDia[dia]) {
        ingresosPorDia[dia] = 0;
      }
      ingresosPorDia[dia] += Number(t.monto);
    });

    return Object.entries(ingresosPorDia)
      .map(([dia, monto]) => ({
        dia: parseInt(dia),
        monto,
      }))
      .sort((a, b) => a.dia - b.dia);

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener ingresos por día.');
  }
}

export async function fetchTransaccionesPorDia(año: number, mes: number, dia: number) {
  noStore();
  try {
    const fechaInicio = new Date(año, mes - 1, dia, 0, 0, 0, 0);
    const fechaFin = new Date(año, mes - 1, dia, 23, 59, 59, 999);

    const transacciones = TransaccionesDB.findMany({
      where: {},
      include: {
        suscripcion: {
          include: {
            socio: true,
          },
        },
      },
    });

    const filtered = transacciones.filter(t => {
      const fecha = new Date(t.fecha);
      return fecha >= fechaInicio && fecha <= fechaFin;
    });

    return filtered.map((t) => ({
      id: t.id,
      monto: Number(t.monto),
      fecha: new Date(t.fecha),
      metodoPago: t.metodoPago,
      notas: t.notas || '',
      socioNombre: t.suscripcion?.socio
        ? `${t.suscripcion.socio.nombre} ${t.suscripcion.socio.apellido}`
        : 'Desconocido',
    }));

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener transacciones del día.');
  }
}

export async function fetchSociosParaHistorialPagos() {
  noStore();
  try {
    const socios = SociosDB.findMany();
    return socios.map(s => ({
      id: s.id,
      nombre: s.nombre,
      apellido: s.apellido,
      dni: s.dni,
    })).sort((a, b) => a.apellido.localeCompare(b.apellido));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener socios para historial de pagos.');
  }
}

export async function fetchHistorialPagosPorSocio(socioId: string, estadoSuscripcion?: string) {
  noStore();
  try {
    const socio = SociosDB.findUnique({ id: socioId });
    if (!socio) return null;

    const suscripciones = SuscripcionesDB.findMany({
      where: {},
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }).filter((s: any) => s.socioId === socioId);

    const allTransacciones = TransaccionesDB.findMany({ where: {} });

    const now = new Date();

    const historial: HistorialPago[] = suscripciones.flatMap((suscripcion: any) =>
      allTransacciones
        .filter((t: any) => t.suscripcionId === suscripcion.id)
        .map((transaccion: any) => ({
          id: transaccion.id,
          fecha: new Date(transaccion.fecha),
          monto: Number(transaccion.monto),
          metodoPago: transaccion.metodoPago,
          notas: transaccion.notas || '',
          tipoPago: transaccion.tipoPago,
          planNombre: suscripcion.plan?.nombre || '',
          suscripcionEstado: getEstadoSuscripcion(suscripcion.activa, new Date(suscripcion.fechaFin), now),
          suscripcionFechaFin: new Date(suscripcion.fechaFin),
        }))
    ).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    const historialFiltrado = estadoSuscripcion
      ? historial.filter((item) => item.suscripcionEstado === estadoSuscripcion)
      : historial;

    const resumenPorEstado: ResumenEstadoHistorial[] = ['Activa', 'Vencida', 'Suspendida'].map((estado) => {
      const items = historial.filter((item) => item.suscripcionEstado === estado);
      return {
        estado,
        cantidad: items.length,
        total: items.reduce((acc, item) => acc + item.monto, 0),
      };
    });

    const totalPagado = historialFiltrado.reduce((acc, item) => acc + item.monto, 0);

    return {
      socio,
      historial: historialFiltrado,
      resumenPorEstado,
      totalPagado,
      cantidadPagos: historialFiltrado.length,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener historial de pagos por socio.');
  }
}
