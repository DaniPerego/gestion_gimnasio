'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditForm from '@/components/socios/edit-form';
import { SociosDB } from '@/lib/db';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [socio, setSocio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const found = SociosDB.findUnique({ id });
    if (found) {
      setSocio(found);
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
    router.push('/admin/socios');
    return null;
  }

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Editar Socio</h1>
      </div>
      <EditForm socio={socio} />
    </main>
  );
}
