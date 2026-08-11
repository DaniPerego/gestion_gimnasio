'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, AuthUser, logout } from '@/lib/auth-simple';
import { seedDemoData } from '@/lib/seed-demo';
import Link from 'next/link';
import NavLinks from '@/components/admin/nav-links';
import MobileSidebar from '@/components/admin/mobile-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '37, 99, 235';
}

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [config, setConfig] = useState<{
    nombreGimnasio: string;
    colorPrimario: string;
    colorSecundario: string;
    fondoUrl: string | null;
    logoUrl: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDemoData();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      // Store current path for redirect after login
      sessionStorage.setItem('gym_redirect_after_login', pathname);
      router.replace('/login');
      return;
    }
    setUser(currentUser);

    // Load config from localStorage
    const raw = localStorage.getItem('gym_configuracion');
    if (raw) {
      try {
        const configs = JSON.parse(raw);
        if (configs.length > 0) {
          setConfig(configs[0]);
        }
      } catch {}
    }

    setLoading(false);
  }, [router, pathname]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const primaryColor = config?.colorPrimario || '#2563eb';
  const secondaryColor = config?.colorSecundario || '#1e40af';
  const nombreGimnasio = config?.nombreGimnasio || 'Gimnasio Demo';
  const fondoUrl = config?.fondoUrl;

  return (
    <div 
      className="flex h-screen flex-col md:flex-row md:overflow-hidden"
      style={{ 
        '--primary-color': primaryColor, 
        '--secondary-color': secondaryColor,
        '--primary-color-rgb': hexToRgb(primaryColor),
        '--secondary-color-rgb': hexToRgb(secondaryColor)
      } as React.CSSProperties}
    >
      {/* Mobile Sidebar */}
      <MobileSidebar 
        permissions={user as any}
        role={user.rol}
        nombreGimnasio={nombreGimnasio}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        fondoUrl={fondoUrl}
      >
        <button 
          onClick={handleLogout}
          className="nav-link flex w-full items-center justify-start gap-2 rounded-md p-3 text-sm font-medium text-white transition-all duration-200"
        >
          Cerrar Sesión
        </button>
      </MobileSidebar>

      {/* Desktop Sidebar */}
      <div 
        className="hidden md:flex w-64 flex-none flex-col px-3 py-4"
        style={{ backgroundColor: primaryColor }}
      >
        <Link
          className="mb-2 flex h-40 items-end justify-start rounded-md p-4 relative overflow-hidden group"
          href="/admin"
          style={{ backgroundColor: secondaryColor }}
        >
          {fondoUrl && (
             <div 
               className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
               style={{ backgroundImage: `url(${fondoUrl})` }} 
             />
          )}
          <div className="w-40 text-white relative z-10">
            <h1 className="text-xl font-bold drop-shadow-md">{nombreGimnasio}</h1>
            {config?.logoUrl && (
                <span className="text-xs opacity-70">Logo Configurado</span>
            )}
          </div>
        </Link>
        
        <div className="flex grow flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-2">
            <NavLinks permissions={user as any} role={user.rol} />
          </div>
          
          <div className="mt-2">
            <button 
              onClick={handleLogout}
              className="nav-link flex h-12 w-full items-center justify-start gap-2 rounded-md p-2 px-3 text-sm font-medium text-white transition-all duration-200"
            >
              <div>Cerrar Sesión</div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenido Principal */}
      <div 
        className="grow p-6 md:overflow-y-auto md:p-12 transition-colors"
        style={{ 
          background: `linear-gradient(135deg, rgba(var(--secondary-color-rgb), 0.05), rgba(var(--primary-color-rgb), 0.05))`
        }}
      >
        <header className="mb-4 md:mb-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">Panel de Administración</h2>
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="text-xs md:text-sm text-gray-700 dark:text-white/90 flex-1 md:flex-initial">
                Hola, <span className="font-semibold">{user.nombre || 'Usuario'}</span>
                <span className="hidden sm:inline"> ({user.rol})</span>
              </div>
              <ThemeToggle />
            </div>
        </header>
        {children}
      </div>
    </div>
  );
}
