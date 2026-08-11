import Link from 'next/link';
import { Usuario } from '@/lib/db';

interface NavLinksProps {
  permissions: Usuario | null;
  role?: string;
  onLinkClick?: () => void; // Para cerrar el menú móvil al hacer click
}

export default function NavLinks({ permissions, role, onLinkClick }: NavLinksProps) {
  const isAdmin = role === 'ADMIN' || role === 'admin';
  const isProfessor = role?.startsWith('PROFESOR_');
  
  const links = [
    { name: 'Inicio', href: '/admin', show: isAdmin || isProfessor },
    { name: 'Usuarios', href: '/admin/usuarios', show: isAdmin || (permissions?.permisoUsuarios ?? false) },
    { name: 'Socios', href: '/admin/socios', show: isAdmin || (permissions?.permisoSocios ?? false) },
    { name: 'Planes', href: '/admin/planes', show: isAdmin || (permissions?.permisoPlanes ?? false) },
    { name: 'Suscripciones', href: '/admin/suscripciones', show: isAdmin || (permissions?.permisoSuscripciones ?? false) },
    { name: 'Asistencias', href: '/admin/asistencias', show: !isProfessor && (isAdmin || (permissions?.permisoAsistencias ?? false)) },
    { name: 'Pagos', href: '/admin/transacciones', show: isAdmin || (permissions?.permisoTransacciones ?? false) },
    { name: 'Cuenta Corriente', href: '/admin/cuenta-corriente', show: isAdmin || (permissions?.permisoTransacciones ?? false) },
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
            className="nav-link flex h-12 grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium text-white transition-all duration-200 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <p className="block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
