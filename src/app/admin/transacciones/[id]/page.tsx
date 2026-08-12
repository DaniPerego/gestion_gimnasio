'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditForm from '@/components/transacciones/edit-form';
import { TransaccionesDB, SuscripcionesDB, SociosDB, CuentasCorrientesDB } from '@/lib/db';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [transaccion, setTransaccion] = useState<any>(null);
  const [suscripciones, setSuscripciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    try {
      const t = TransaccionesDB.findUnique(
        { id },
        { suscripcion: { include: { socio: true, plan: true } } }
      );

      if (!t) {
        router.push('/admin/transacciones');
        return;
      }

      setTransaccion({
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
      });

      // Load active suscripciones for select
      const socios = SociosDB.findMany();
      const subs = SuscripcionesDB.findMany({
        where: {},
        include: { socio: true, plan: true },
        orderBy: { createdAt: 'desc' },
      });

      const enriched = subs.map((s: any) => {
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

      setSuscripciones(enriched);
    } catch {
      router.push('/admin/transacciones');
    }
    setLoading(false);
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!transaccion) return null;

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Editar Transacción</h1>
      <EditForm transaccion={transaccion} suscripciones={suscripciones} />
    </div>
  );
}
