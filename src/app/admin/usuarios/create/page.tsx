'use client';

import Form from '@/components/usuarios/create-form';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-simple';

export default function CreateUsuarioPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.rol !== 'ADMIN') {
      router.replace('/admin/usuarios');
    }
  }, [router]);

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl font-bold">
        Crear Usuario
      </h1>
      <Form />
    </main>
  );
}
