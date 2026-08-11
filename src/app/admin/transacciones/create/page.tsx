'use client';

import Form from '@/components/transacciones/create-form';
import { fetchActiveSuscripcionesForSelect } from '@/lib/data-transacciones';
import { ConfiguracionDB } from '@/lib/db';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTransaccionPage() {
  const router = useRouter();
  const [suscripciones, setSuscripciones] = useState<any[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchActiveSuscripcionesForSelect();
        setSuscripciones(data);
        const config = ConfiguracionDB.findFirst();
        setLogoUrl(config?.logoUrl || null);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl font-bold">
        Registrar Pago
      </h1>
      <Form suscripciones={suscripciones} logoUrl={logoUrl} />
    </main>
  );
}
