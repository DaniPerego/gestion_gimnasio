'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditForm from '@/components/planes/edit-form';
import { PlanesDB, Plan } from '@/lib/db';

type PlanSerializable = Omit<Plan, 'precio'> & { precio: number };

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanSerializable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const found = PlanesDB.findUnique({ id });
    if (found) {
      setPlan({ ...found, precio: Number(found.precio) });
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

  if (!plan) {
    router.push('/admin/planes');
    return null;
  }

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Editar Plan</h1>
      </div>
      <EditForm plan={plan} />
    </main>
  );
}
