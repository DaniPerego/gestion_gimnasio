'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  ArrowPathIcon,
  ClipboardDocumentIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type TicketData = {
  id: string;
  socioNombre: string;
  planNombre: string;
  tipoPago: 'CUOTA_SUSCRIPCION' | 'OTRO';
  monto: number;
  fecha: Date;
  fechaVencimiento: Date;
  metodoPago: string;
  notas?: string | null;
  telefonoSocio?: string | null;
};

interface TicketReceiptProps {
  data: TicketData;
  onClose: () => void;
  logoUrl?: string | null;
}

export default function TicketReceipt({ data, onClose, logoUrl }: TicketReceiptProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isCopying, setIsCopying] = React.useState(false);
  const [currentDateTime] = React.useState(new Date());
  const ticketConcept = data.notas?.trim() || (data.tipoPago === 'CUOTA_SUSCRIPCION' ? `Cuota ${data.planNombre}` : 'Pago registrado');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatMessageDate = (paymentDate: Date) => {
    const dateStr = new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(new Date(paymentDate));

    const timeStr = new Intl.DateTimeFormat('es-AR', {
      timeStyle: 'short',
    }).format(currentDateTime);

    return `${dateStr} a las ${timeStr}`;
  };

  const normalizePhoneForWhatsApp = (phone: string) => {
    const digits = phone.replace(/\D/g, '');

    if (!digits) return '';
    if (digits.startsWith('549')) return digits;
    if (digits.startsWith('54')) return `549${digits.slice(2)}`;
    if (digits.startsWith('9')) return `54${digits}`;

    return `549${digits}`;
  };

  const formatDueDate = (dueDate: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(new Date(dueDate));
  };

  const buildWhatsAppMessage = () => {
    return [
      `Hola ${data.socioNombre}.`,
      '',
      'COMPROBANTE DE PAGO',
      '',
      `Concepto: ${ticketConcept}`,
      `Fecha de pago: ${formatMessageDate(data.fecha)}`,
      `Fecha de vencimiento: ${formatDueDate(data.fechaVencimiento)}`,
      `Monto: ${formatCurrency(data.monto)}`,
      '',
      'Gracias por entrenar con nosotros',
      'Administración Bendito Cross',
    ].join('\n');
  };

  const handleCopyToClipboard = async () => {
    if (!ticketRef.current) return;

    setIsCopying(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

      if (!blob) throw new Error('Falló la conversión a imagen');

      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        alert('¡Ticket copiado al portapapeles! 📋\n\nVe a WhatsApp y presiona Ctrl + V (Pegar).');
      } catch (clipboardError) {
        console.warn('Falló el portapapeles, usando descarga como fallback:', clipboardError);
        const link = document.createElement('a');
        link.download = `comprobante-${data.socioNombre.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('No se pudo copiar automáticamente (el navegador lo bloqueó).\n\n📥 Se ha descargado la imagen en tu dispositivo.');
      }
    } catch (error: any) {
      console.error('Error generando ticket:', error);
      alert(`Error técnico: ${error?.message || 'Error desconocido'}. \n\nPor favor intenta tomar una foto manual.`);
    } finally {
      setIsCopying(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!data.telefonoSocio) {
      alert('El socio no tiene número de teléfono registrado.');
      return;
    }

    const finalPhone = normalizePhoneForWhatsApp(data.telefonoSocio);
    if (!finalPhone) {
      alert('El número de teléfono no es válido para WhatsApp.');
      return;
    }

    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
          <h3 className="font-bold text-gray-700">Comprobante de Pago</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-center overflow-y-auto bg-gray-100 p-6">
          <div
            ref={ticketRef}
            className="relative w-[340px] border p-5 text-center"
            style={{
              fontFamily: 'monospace',
              backgroundColor: '#ffffff',
              borderColor: '#e5e7eb',
              color: '#1f2937',
            }}
          >
            <div className="mb-4 border-b-2 border-dashed pb-4" style={{ borderColor: '#d1d5db' }}>
              <h2 className="mb-1 text-2xl font-bold uppercase tracking-wider" style={{ color: '#1f2937' }}>Bendito Cross</h2>
              <p className="text-sm font-medium" style={{ color: '#4b5563' }}>Funcional Cross y Musculación</p>
            </div>

            <div className="mb-4 border-b border-dashed pb-3" style={{ borderColor: '#e5e7eb' }}>
              <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: '#4b5563' }}>COMPROBANTE DE PAGO</p>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-start justify-between">
                <div className="w-2/3">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Socio</p>
                  <p className="break-words text-lg font-bold leading-snug" style={{ color: '#1f2937' }}>{data.socioNombre}</p>
                  <p className="mt-1 text-xs font-medium uppercase" style={{ color: '#6b7280' }}>{data.planNombre}</p>
                </div>
                <div className="w-1/3 pt-1 text-right">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Fecha</p>
                  <p className="text-xs font-medium" style={{ color: '#4b5563' }}>
                    {new Date(data.fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                  </p>
                  <p className="text-[10px]" style={{ color: '#9ca3af' }}>
                    {currentDateTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="my-2 border-t border-dashed" style={{ borderColor: '#e5e7eb' }}></div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Método</p>
                  <p className="inline-block rounded border px-2 py-1 text-sm font-bold uppercase" style={{ color: '#374151', borderColor: '#d1d5db', backgroundColor: '#f9fafb' }}>
                    {data.metodoPago}
                  </p>
                </div>
                <div className="text-right">
                  <p className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Total</p>
                  <p className="text-3xl font-black" style={{ color: '#000000' }}>{formatCurrency(data.monto)}</p>
                </div>
              </div>

              <div className="my-2 border-t border-dashed" style={{ borderColor: '#e5e7eb' }}></div>

              <div className="flex items-start justify-between gap-4 pt-1">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Concepto</p>
                  <p className="text-sm font-bold italic" style={{ color: '#4b5563' }}>
                    &quot;{ticketConcept}&quot;
                  </p>
                </div>
                <div className="w-28 shrink-0 text-right">
                  <p className="mb-1 text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Vencimiento</p>
                  <p className="text-xs font-medium leading-snug" style={{ color: '#4b5563' }}>
                    {new Date(data.fechaVencimiento).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t-2 border-dashed pt-3 text-center" style={{ borderColor: '#d1d5db' }}>
              <p className="mb-1 text-[10px]" style={{ color: '#9ca3af' }}>Gracias por entrenar con nosotros</p>
              <p className="mb-1 text-[10px] font-semibold" style={{ color: '#6b7280' }}>Administración Bendito Cross</p>
              <p className="text-[9px]" style={{ color: '#d1d5db' }}>ID: {data.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleOpenWhatsApp}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!data.telefonoSocio}
              title={!data.telefonoSocio ? 'El socio no tiene teléfono' : 'Abrir WhatsApp'}
            >
              <PaperAirplaneIcon className="h-4 w-4 -rotate-45" />
              1. WhatsApp
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              disabled={isCopying}
            >
              {isCopying ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
              2. Copiar
            </button>
          </div>
          <p className="text-center text-xs text-gray-500">
            Pasos: Toca &quot;Abrir WhatsApp&quot; y luego pega (Ctrl+V) la imagen en el chat.
          </p>
        </div>
      </div>
    </div>
  );
}
