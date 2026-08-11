'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CheckInForm from '@/components/asistencias/check-in-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { getConfiguracion } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth-simple';

export default function KioscoPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
  }, [router]);

  const config = typeof window !== 'undefined' ? (() => {
    try {
      const raw = localStorage.getItem('gym_configuracion');
      if (raw) {
        const configs = JSON.parse(raw);
        return configs[0] || null;
      }
    } catch {}
    return null;
  })() : null;

  const primaryColor = config?.colorPrimario || '#e74c3c';
  const fondoUrl = config?.fondoUrl;

  return (
    <main 
      className="relative flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 overflow-hidden"
      style={{ '--primary-color': primaryColor } as React.CSSProperties}
    >
      {fondoUrl && (
        <>
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${fondoUrl})` }}
          />
          <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm" />
        </>
      )}

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md p-8 shadow-2xl glass-card relative z-10">
        <div className="mb-6 text-center">
          {config?.logoUrl && (
            <div className="mb-6 flex justify-center">
                <img src={config.logoUrl} alt="Logo" className="h-32 object-contain drop-shadow-lg" />
            </div>
          )}
          {config?.nombreGimnasio && (
             <h2 className="text-lg font-medium text-gray-300 mb-1 uppercase tracking-wide">{config.nombreGimnasio}</h2>
          )}
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
            Control de Acceso
          </h1>
          <p className="text-gray-300 text-sm">Ingrese su DNI para registrar asistencia</p>
        </div>
        <CheckInForm logoUrl={config?.logoUrl} nombreGimnasio={config?.nombreGimnasio} />
      </div>
    </main>
  );
}
