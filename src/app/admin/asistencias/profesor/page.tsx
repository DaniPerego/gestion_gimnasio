'use client';

import ProfesorPanel from '@/components/asistencias/profesor-panel';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-simple';

export default function ProfesorPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!user.rol?.startsWith('PROFESOR')) {
      router.replace('/admin');
    }
  }, [router]);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('gym_session') || '{}') : {};
  
  let discipline = 'musculacion';
  switch (user.rol) {
    case 'PROFESOR_CROSSFIT':
      discipline = 'crossfit';
      break;
    case 'PROFESOR_FUNCIONAL':
      discipline = 'funcional';
      break;
  }

  return <ProfesorPanel discipline={discipline} />;
}
