import Link from 'next/link';
import { Usuario } from '@prisma/client';

interface NavLinksProps {
  permissions: Usuario | null;
  role?: string;
  onLinkClick?: () => void; // Para cerrar el menú móvil al hacer click
}

export default function NavLinks({ permissions, role, onLinkClick }: NavLinksProps) {
  const isAdmin = role === 'ADMIN' || role === 'admin';
  
  const links = [
    { name: 'Dashboard', href: '/admin', show: isAdmin },
    { name: 'Usuarios', href: '/admin/usuarios', show: isAdmin || (permissions?.permisoUsuarios ?? false) },
    { name: 'Socios', href: '/admin/socios', show: isAdmin || (permissions?.permisoSocios ?? false) },
    { name: 'Planes', href: '/admin/planes', show: isAdmin || (permissions?.permisoPlanes ?? false) },
    { name: 'Suscripciones', href: '/admin/suscripciones', show: isAdmin || (permissions?.permisoSuscripciones ?? false) },
    { name: 'Asistencias', href: '/admin/asistencias', show: isAdmin || (permissions?.permisoAsistencias ?? false) },
    { name: 'Transacciones', href: '/admin/transacciones', show: isAdmin || (permissions?.permisoTransacciones ?? false) },
    { name: 'Reportes', href: '/admin/reportes', show: isAdmin || (permissions?.permisoReportes ?? false) },
    { name: 'Configuración', href: '/admin/configuracion', show: isAdmin || (permissions?.permisoConfiguracion ?? false) },
  ];

  return (
    <>
      {links.filter(link => link.show).map((link) => {
        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onLinkClick}
            className="flex h-12 grow items-center justify-center gap-2 rounded-md bg-white/10 p-3 text-sm font-medium text-white hover:bg-white/20 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <p className="block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
