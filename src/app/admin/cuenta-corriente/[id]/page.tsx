'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CuentaCorrienteManager from '@/components/cuenta-corriente/manager';
import { SociosDB, CuentasCorrientesDB, MovimientosCCDB, SuscripcionesDB, TransaccionesDB } from '@/lib/db';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [socio, setSocio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socioId = params.id as string;
    try {
      const socioData = SociosDB.findUnique({ id: socioId });
      if (!socioData) {
        setLoading(false);
        return;
      }

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

      setSocio({
        ...socioData,
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
      });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!socio) {
    router.push('/admin/cuenta-corriente');
    return null;
  }

  return (
    <main>
      <div className="mb-6">
        <Link
          href="/admin/cuenta-corriente"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Volver a Cuenta Corriente
        </Link>
      </div>
      <CuentaCorrienteManager socio={socio} />
    </main>
  );
}
