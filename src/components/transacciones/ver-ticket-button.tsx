'use client';

import { useState } from 'react';
import { TicketIcon } from '@heroicons/react/24/outline';
import TicketReceipt from './ticket-receipt';

interface TicketData {
  id: string;
  socioNombre: string;
  planNombre: string;
  monto: number;
  fecha: Date;
  metodoPago: string;
  notas?: string | null;
  telefonoSocio?: string | null;
}

export default function VerTicketButton({ 
  ticketData,
  logoUrl 
}: { 
  ticketData: TicketData;
  logoUrl?: string;
}) {
  const [showTicket, setShowTicket] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowTicket(true)}
        className="rounded-md border p-2 hover:bg-gray-100"
        title="Ver Ticket"
      >
        <TicketIcon className="w-5" />
      </button>

      {showTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <TicketReceipt 
              data={ticketData} 
              onClose={() => setShowTicket(false)}
              logoUrl={logoUrl} 
            />
          </div>
        </div>
      )}
    </>
  );
}
