'use client';

import { useState } from 'react';

export default function WhatsAppButton({ telefono, nombre }: { telefono?: string | null, nombre: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  if (!telefono) {
    return <span className="text-gray-300 p-2" title="Sin teléfono">📱</span>;
  }

  const handleSend = () => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${telefono}?text=${encodedMessage}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-md border p-2 hover:bg-green-50 text-green-600 transition-colors"
        title="Enviar WhatsApp"
      >
        📱
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10 bg-black/20" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              Mensaje para {nombre}
            </h3>
            <textarea
              className="mb-3 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              rows={3}
              placeholder="Escribe tu mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500"
              >
                Enviar WhatsApp
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
