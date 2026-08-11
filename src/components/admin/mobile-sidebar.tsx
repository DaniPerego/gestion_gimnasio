'use client';

import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NavLinks from './nav-links';
import { Usuario } from '@/lib/db';

interface MobileSidebarProps {
  permissions: Usuario | null;
  role?: string;
  nombreGimnasio: string;
  primaryColor: string;
  secondaryColor: string;
  fondoUrl?: string | null;
  children?: React.ReactNode; // Para el botón de salir
}

export default function MobileSidebar({ 
  permissions, 
  role, 
  nombreGimnasio, 
  primaryColor,
  secondaryColor,
  fondoUrl,
  children
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="md:hidden w-full shadow-lg relative border-b border-red-600" 
      style={{ backgroundColor: '#000000' }}
      suppressHydrationWarning
    >
      <div className="relative overflow-visible">
        {fondoUrl && (
          <div 
            className="absolute inset-0 z-0 flex items-center justify-center" 
          >
            <img 
              src={fondoUrl} 
              alt="Logo" 
              className="h-[144px] w-auto max-w-[280px] object-contain opacity-70"
            />
          </div>
        )}
        <div className="flex items-center justify-between p-4 relative z-10">
          <span className="text-white font-bold text-lg truncate drop-shadow-md">
            {nombreGimnasio}
          </span>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-red-600 p-2 rounded-md hover:bg-red-600/20 focus:outline-none transition-colors border border-red-600"
            aria-label="Abrir menú"
          >
            {isOpen ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div 
          className="absolute top-full left-0 w-full z-50 px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-xl max-h-[80vh] overflow-y-auto border-l border-r border-b border-red-600"
          style={{ backgroundColor: '#000000' }}
        >
           <NavLinks 
             permissions={permissions} 
             role={role} 
             onLinkClick={() => setIsOpen(false)} 
           />
           <div className="pt-2 mt-2 border-t border-red-600/40">
             {children}
           </div>
        </div>
      )}
    </div>
  );
}
