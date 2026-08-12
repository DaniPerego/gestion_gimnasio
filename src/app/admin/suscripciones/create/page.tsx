'use client';

import { useState, useEffect } from 'react';
import Form from '@/components/suscripciones/create-form';
import { SociosDB, PlanesDB } from '@/lib/db';
import { Socio, Plan } from '@/lib/db';

type PlanSerializable = Omit<Plan, 'precio'> & { precio: number };

export default function Page() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [planes, setPlanes] = useState<PlanSerializable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sociosData = SociosDB.findMany({
      where: { activo: true },
      orderBy: { apellido: 'asc' },
    });
    const planesData = PlanesDB.findMany({
      where: { activo: true },
      orderBy: { precio: 'asc' },
    }).map(p => ({ ...p, precio: Number(p.precio) }));

    setSocios(sociosData);
    setPlanes(planesData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl font-bold">
        Nueva Suscripción
      </h1>
      <Form socios={socios} planes={planes} />
    </main>
  );
}
