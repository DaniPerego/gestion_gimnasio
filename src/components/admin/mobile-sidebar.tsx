'use client';

import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NavLinks from './nav-links';
import { Usuario } from '@prisma/client';

interface MobileSidebarProps {
  permissions: Usuario | null;
  role?: string;
  nombreGimnasio: string;
  primaryColor: string;
  children?: React.ReactNode; // Para el botón de salir
}

export default function MobileSidebar({ 
  permissions, 
  role, 
  nombreGimnasio, 
  primaryColor,
  children
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden w-full shadow-md" style={{ backgroundColor: primaryColor }}>
      <div className="flex items-center justify-between p-4">
        <span className="text-white font-bold text-lg truncate">{nombreGimnasio}</span>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-white p-2 rounded-md hover:bg-white/10 focus:outline-none"
          aria-label="Abrir menú"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
           <NavLinks 
             permissions={permissions} 
             role={role} 
             onLinkClick={() => setIsOpen(false)} 
           />
           <div className="pt-2 mt-2 border-t border-white/20">
             {children}
           </div>
        </div>
      )}
    </div>
  );
}
