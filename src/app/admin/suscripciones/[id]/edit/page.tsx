'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditForm from '@/components/suscripciones/edit-form';
import { SuscripcionesDB } from '@/lib/db';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [suscripcion, setSuscripcion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const found = SuscripcionesDB.findUnique(
      { id },
      { socio: true, plan: true }
    );

    if (!found) {
      setLoading(false);
      return;
    }

    setSuscripcion({
      ...found,
      fechaFin: new Date(found.fechaFin),
      fechaInicio: new Date(found.fechaInicio),
      plan: {
        ...found.plan,
        precio: Number(found.plan?.precio || 0),
      },
    });
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!suscripcion) {
    router.push('/admin/suscripciones');
    return null;
  }

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl font-bold">
        Editar Suscripción
      </h1>
      <EditForm suscripcion={suscripcion} />
    </main>
  );
}
