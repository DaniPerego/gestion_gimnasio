import { getConfiguracion } from '@/lib/data';
import { auth, signOut } from '@/auth';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfiguracion();
  const session = await auth();

  // Valores por defecto si no hay configuración
  const primaryColor = config?.colorPrimario || '#2563eb'; // blue-600
  const secondaryColor = config?.colorSecundario || '#1e40af'; // blue-800
  const nombreGimnasio = config?.nombreGimnasio || 'GMS White-Label';

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      {/* Sidebar con estilos dinámicos */}
      <div 
        className="w-full flex-none md:w-64"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
          <Link
            className="mb-2 flex h-20 items-end justify-start rounded-md p-4 md:h-40"
            href="/admin"
            style={{ backgroundColor: secondaryColor }}
          >
            <div className="w-32 text-white md:w-40">
              <h1 className="text-xl font-bold">{nombreGimnasio}</h1>
              {config?.logoUrl && (
                 // Placeholder para logo si existiera URL
                 <span className="text-xs opacity-70">Logo Configurado</span>
              )}
            </div>
          </Link>
          
          <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
            <NavLinks />
            <div className="hidden h-auto w-full grow rounded-md bg-white/10 md:block"></div>
            
            <form
              action={async () => {
                'use server';
                await signOut();
              }}
            >
              <button className="flex h-12 w-full grow items-center justify-center gap-2 rounded-md bg-white/10 p-3 text-sm font-medium text-white hover:bg-white/20 md:flex-none md:justify-start md:p-2 md:px-3">
                <div className="hidden md:block">Cerrar Sesión</div>
                <div className="text-xs opacity-70 md:hidden">Salir</div>
              </button>
            </form>
          </div>
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

function NavLinks() {
  const links = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Socios', href: '/admin/socios' },
    { name: 'Planes', href: '/admin/planes' },
    { name: 'Suscripciones', href: '/admin/suscripciones' },
    { name: 'Asistencias', href: '/admin/asistencias' },
    { name: 'Transacciones', href: '/admin/transacciones' },
    { name: 'Reportes', href: '/admin/reportes' },
    { name: 'Configuración', href: '/admin/configuracion' },
  ];

  return (
    <>
      {links.map((link) => {
        return (
          <Link
            key={link.name}
            href={link.href}
            className="flex h-12 grow items-center justify-center gap-2 rounded-md bg-white/10 p-3 text-sm font-medium text-white hover:bg-white/20 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <p className="hidden md:block">{link.name}</p>
            <p className="block md:hidden text-xs">{link.name.slice(0,3)}</p>
          </Link>
        );
      })}
    </>
  );
}
