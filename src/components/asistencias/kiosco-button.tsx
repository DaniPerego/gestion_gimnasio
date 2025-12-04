'use client';

import { ComputerDesktopIcon } from '@heroicons/react/24/outline';

export default function KioscoButton() {
  const openKiosco = () => {
    window.open('/kiosco', 'Kiosco', 'width=1024,height=768,menubar=no,toolbar=no,location=no,status=no,scrollbars=no');
  };

  return (
    <button
      onClick={openKiosco}
      className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
      title="Abrir en ventana independiente (Modo Kiosco)"
    >
      <ComputerDesktopIcon className="h-5 w-5" />
      Abrir Modo Kiosco
    </button>
  );
}
