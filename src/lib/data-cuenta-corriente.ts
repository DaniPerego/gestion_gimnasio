import { SociosDB, CuentasCorrientesDB, SuscripcionesDB, PlanesDB, TransaccionesDB, MovimientosCCDB } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 15;

export async function fetchSociosConCuentaCorriente(
  query: string,
  currentPage: number,
  filtro?: string
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    let socios = SociosDB.findMany({
      where: { activo: true },
      include: { cuentaCorriente: true },
      orderBy: { apellido: 'asc' },
    });

    // Filter by query
    if (query) {
      const q = query.toLowerCase();
      socios = socios.filter(s => 
        s.nombre?.toLowerCase().includes(q) ||
        s.apellido?.toLowerCase().includes(q) ||
        s.dni?.includes(q)
      ) as any[];
    }

    // Apply filters
    if (filtro === 'con-cuenta') {
      socios = socios.filter((s: any) => s.cuentaCorriente !== null);
    } else if (filtro === 'sin-cuenta') {
      socios = socios.filter((s: any) => s.cuentaCorriente === null);
    } else if (filtro === 'con-deuda') {
      socios = socios.filter((s: any) => s.cuentaCorriente && s.cuentaCorriente.saldoDeuda > 0);
    } else if (filtro === 'con-credito') {
      socios = socios.filter((s: any) => s.cuentaCorriente && s.cuentaCorriente.saldoCredito > 0);
    }

    const paginated = socios.slice(offset, offset + ITEMS_PER_PAGE);

    // Convertir Decimal a number
    return paginated.map((s: any) => ({
      ...s,
      cuentaCorriente: s.cuentaCorriente ? {
        ...s.cuentaCorriente,
        saldoDeuda: Number(s.cuentaCorriente.saldoDeuda),
        saldoCredito: Number(s.cuentaCorriente.saldoCredito),
      } : null,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener socios con cuenta corriente.');
  }
}

export async function fetchSociosCuentaCorrientePages(query: string, filtro?: string) {
  noStore();
  try {
    let socios = SociosDB.findMany({
      where: { activo: true },
      include: { cuentaCorriente: true },
    });

    if (query) {
      const q = query.toLowerCase();
      socios = socios.filter(s => 
        s.nombre?.toLowerCase().includes(q) ||
        s.apellido?.toLowerCase().includes(q) ||
        s.dni?.includes(q)
      ) as any[];
    }

    if (filtro === 'con-cuenta') {
      socios = socios.filter((s: any) => s.cuentaCorriente !== null);
    } else if (filtro === 'sin-cuenta') {
      socios = socios.filter((s: any) => s.cuentaCorriente === null);
    } else if (filtro === 'con-deuda') {
      socios = socios.filter((s: any) => s.cuentaCorriente && s.cuentaCorriente.saldoDeuda > 0);
    } else if (filtro === 'con-credito') {
      socios = socios.filter((s: any) => s.cuentaCorriente && s.cuentaCorriente.saldoCredito > 0);
    }

    return Math.ceil(socios.length / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al contar socios.');
  }
}

export async function fetchSocioConCuentaCorriente(socioId: string) {
  noStore();
  try {
    const socio = SociosDB.findUnique({ id: socioId });
    if (!socio) return null;

    const cuentaCorriente = CuentasCorrientesDB.findUnique({ socioId });
    const movimientos = cuentaCorriente
      ? MovimientosCCDB.findMany({ where: { cuentaCorrienteId: cuentaCorriente.id }, orderBy: { createdAt: 'desc' } })
      : [];

    const suscripciones = SuscripcionesDB.findMany({
      where: {},
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    }).filter((s: any) => s.socioId === socioId);

    const allTransacciones = TransaccionesDB.findMany({ where: {} });

    const suscripcionesConTransacciones = suscripciones.map((sub: any) => ({
      ...sub,
      plan: sub.plan,
      transacciones: allTransacciones
        .filter((t: any) => t.suscripcionId === sub.id && t.tipoPago === 'CUOTA_SUSCRIPCION')
        .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    }));

    const cuotasPagadas = suscripcionesConTransacciones.flatMap((suscripcion: any) =>
      suscripcion.transacciones.map((transaccion: any) => ({
        id: transaccion.id,
        suscripcionId: suscripcion.id,
        planNombre: suscripcion.plan?.nombre,
        monto: Number(transaccion.monto),
        fecha: new Date(transaccion.fecha),
        metodoPago: transaccion.metodoPago,
        notas: transaccion.notas,
      }))
    ).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    const totalCuotasPagadas = cuotasPagadas.reduce((acc, cuota) => acc + cuota.monto, 0);

    const saldoDeuda = cuentaCorriente ? Number(cuentaCorriente.saldoDeuda) : 0;
    const saldoCredito = cuentaCorriente ? Number(cuentaCorriente.saldoCredito) : 0;
    const deudaActual = Math.max(saldoDeuda - saldoCredito, 0);

    return {
      ...socio,
      cuentaCorriente: cuentaCorriente ? {
        ...cuentaCorriente,
        saldoDeuda,
        saldoCredito,
        movimientos: movimientos.map(m => ({
          ...m,
          monto: Number(m.monto),
          createdAt: new Date(m.createdAt),
        })),
      } : null,
      suscripciones: suscripcionesConTransacciones,
      resumenCuotas: {
        cantidadPagadas: cuotasPagadas.length,
        totalPagado: totalCuotasPagadas,
        deudaActual,
      },
      cuotasPagadas,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener socio con cuenta corriente.');
  }
}
