'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditForm from '@/components/usuarios/edit-form';
import { UsuariosDB } from '@/lib/db';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const found = UsuariosDB.findUnique({ id });
    if (found) {
      setUsuario(found);
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

  if (!usuario) {
    router.push('/admin/usuarios');
    return null;
  }

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl font-bold">
        Editar Usuario
      </h1>
      <EditForm usuario={usuario} />
    </main>
  );
}
