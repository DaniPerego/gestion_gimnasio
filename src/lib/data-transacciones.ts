import { TransaccionesDB, SuscripcionesDB, SociosDB, PlanesDB } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;

export async function fetchTransacciones(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const transacciones = TransaccionesDB.findMany({
      skip: offset,
      take: ITEMS_PER_PAGE,
      where: {},
      include: {
        suscripcion: {
          include: {
            socio: true,
            plan: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });
    
    // Filter by query on socio fields
    const filtered = query
      ? transacciones.filter(t => {
          const socio = t.suscripcion?.socio;
          if (!socio) return false;
          const q = query.toLowerCase();
          return (
            socio.nombre?.toLowerCase().includes(q) ||
            socio.apellido?.toLowerCase().includes(q) ||
            socio.dni?.includes(q)
          );
        })
      : transacciones;
    
    return filtered.map(t => ({
      ...t,
      fecha: new Date(t.fecha),
      monto: Number(t.monto),
      suscripcion: t.suscripcion ? {
        ...t.suscripcion,
        fechaFin: new Date(t.suscripcion.fechaFin),
        fechaInicio: new Date(t.suscripcion.fechaInicio),
        plan: {
          ...t.suscripcion.plan,
          precio: Number(t.suscripcion.plan?.precio || 0)
        }
      } : undefined
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener transacciones.');
  }
}

export async function fetchTransaccionesPages(query: string) {
  noStore();
  try {
    const all = TransaccionesDB.findMany({
      where: {},
      include: {
        suscripcion: {
          include: {
            socio: true,
          },
        },
      },
    });
    
    const filtered = query
      ? all.filter(t => {
          const socio = t.suscripcion?.socio;
          if (!socio) return false;
          const q = query.toLowerCase();
          return (
            socio.nombre?.toLowerCase().includes(q) ||
            socio.apellido?.toLowerCase().includes(q) ||
            socio.dni?.includes(q)
          );
        })
      : all;
    
    return Math.ceil(filtered.length / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener el total de transacciones.');
  }
}

export async function fetchActiveSuscripcionesForSelect() {
  noStore();
  try {
    const socios = SociosDB.findMany();
    const suscripciones = SuscripcionesDB.findMany({
      where: {},
      include: {
        socio: true,
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Enrich with cuenta corriente
    const { CuentasCorrientesDB } = await import('@/lib/db');
    return suscripciones.map(s => {
      const cc = CuentasCorrientesDB.findUnique({ socioId: s.socioId });
      return {
        ...s,
        fechaFin: new Date(s.fechaFin),
        fechaInicio: new Date(s.fechaInicio),
        socio: {
          ...s.socio,
          cuentaCorriente: cc ? {
            ...cc,
            saldoDeuda: Number(cc.saldoDeuda),
            saldoCredito: Number(cc.saldoCredito),
          } : null,
        },
        plan: {
          ...s.plan,
          precio: Number(s.plan?.precio || 0)
        }
      };
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener suscripciones para pagos.');
  }
}

export async function fetchTransaccionById(id: string) {
  noStore();
  try {
    const transaccion = TransaccionesDB.findUnique(
      { id },
      { suscripcion: { include: { socio: true, plan: true } } }
    );

    if (!transaccion) {
      throw new Error('Transacción no encontrada');
    }

    return {
      ...transaccion,
      fecha: new Date(transaccion.fecha),
      monto: Number(transaccion.monto),
      suscripcion: transaccion.suscripcion ? {
        ...transaccion.suscripcion,
        fechaFin: new Date(transaccion.suscripcion.fechaFin),
        fechaInicio: new Date(transaccion.suscripcion.fechaInicio),
        plan: {
          ...transaccion.suscripcion.plan,
          precio: Number(transaccion.suscripcion.plan?.precio || 0)
        }
      } : undefined
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al obtener la transacción.');
  }
}
