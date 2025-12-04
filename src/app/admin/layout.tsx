import { getConfiguracion } from '@/lib/data';
import { auth, signOut } from '@/auth';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import NavLinks from '@/components/admin/nav-links';
import MobileSidebar from '@/components/admin/mobile-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfiguracion();
  const session = await auth();

  let userPermissions = null;
  if (session?.user?.email) {
    userPermissions = await prisma.usuario.findUnique({
        where: { email: session.user.email },
    });
  }

  // Valores por defecto si no hay configuración
  const primaryColor = config?.colorPrimario || '#2563eb'; // blue-600
  const secondaryColor = config?.colorSecundario || '#1e40af'; // blue-800
  const nombreGimnasio = config?.nombreGimnasio || 'GMS White-Label';

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        permissions={userPermissions}
        role={userPermissions?.rol}
        nombreGimnasio={nombreGimnasio}
        primaryColor={primaryColor}
      >
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <button className="flex w-full items-center justify-start gap-2 rounded-md bg-white/10 p-3 text-sm font-medium text-white hover:bg-white/20">
            Cerrar Sesión
          </button>
        </form>
      </MobileSidebar>

      {/* Desktop Sidebar */}
      <div 
        className="hidden md:flex w-64 flex-none flex-col px-3 py-4"
        style={{ backgroundColor: primaryColor }}
      >
        <Link
          className="mb-2 flex h-40 items-end justify-start rounded-md p-4"
          href="/admin"
          style={{ backgroundColor: secondaryColor }}
        >
          <div className="w-40 text-white">
            <h1 className="text-xl font-bold">{nombreGimnasio}</h1>
            {config?.logoUrl && (
                <span className="text-xs opacity-70">Logo Configurado</span>
            )}
          </div>
        </Link>
        
        <div className="flex grow flex-col space-y-2">
          <NavLinks permissions={userPermissions} role={userPermissions?.rol} />
          <div className="h-auto w-full grow rounded-md bg-white/10"></div>
          
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
            <button className="flex h-12 w-full items-center justify-start gap-2 rounded-md bg-white/10 p-2 px-3 text-sm font-medium text-white hover:bg-white/20">
              <div>Cerrar Sesión</div>
            </button>
          </form>
        </div>
      </div>
      
      {/* Contenido Principal */}
      <div className="grow p-6 md:overflow-y-auto md:p-12 bg-gray-50">
        <header className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
            <div className="text-sm text-gray-600">
                Hola, <span className="font-semibold">{session?.user?.name || 'Usuario'}</span> ({session?.user?.rol})
            </div>
        </header>
        {children}
      </div>
    </div>
  );
}
