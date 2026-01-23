'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  ArrowPathIcon, 
  ClipboardDocumentIcon, 
  PaperAirplaneIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

// Tipos requeridos para mostrar la info
type TicketData = {
  id: string;
  socioNombre: string;
  planNombre: string;
  monto: number;
  fecha: Date;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessageDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `ticket-${data.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error al descargar el ticket:', error);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          alert('¡Imagen copiada al portapapeles!');
        }
      });
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  const handleSendWhatsApp = () => {
    if (!data.telefonoSocio) {
      alert('No hay número de teléfono registrado para este socio.');
      return;
    }

    const cleanPhone = data.telefonoSocio.replace(/\D/g, '');
    const finalPhone = cleanPhone;

    const message = `Hola ${data.socioNombre}! 👋\n\nAdjunto te envío el comprobante de pago.\n\nFecha: ${formatMessageDate(data.fecha)}\nMonto: ${formatCurrency(data.monto)}\n\n¡Gracias por entrenar con nosotros! 💪`;

    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header del Modal */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Comprobante de Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido del Ticket (scrolleable) */}
        <div className="flex-1 overflow-y-auto p-4">
          <div
            ref={ticketRef}
            className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300"
          >
            {/* Logo */}
            {logoUrl && (
              <div className="flex justify-center mb-4">
                <img src={logoUrl} alt="Logo" className="h-16 object-contain" />
              </div>
            )}

            {/* Título */}
            <h3 className="text-center text-xl font-bold text-gray-900 mb-4">
              COMPROBANTE DE PAGO
            </h3>

            {/* Información del ticket */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ticket #:</span>
                <span className="font-medium text-gray-900">{data.id.slice(0, 8)}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Socio:</span>
                  <span className="font-medium text-gray-900">{data.socioNombre}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium text-gray-900">{data.planNombre}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Método de Pago:</span>
                <span className="font-medium text-gray-900">{data.metodoPago}</span>
              </div>

              {data.notas && (
                <div className="pt-3 border-t">
                  {data.notas.includes('Cuenta Corriente:') ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Detalle del Pago:</p>
                      <div className="bg-blue-50 rounded-md p-2 text-xs space-y-1">
                        {data.notas.split(' | ')[0].split(' + ').map((line, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-gray-700">{line.split(':')[0]}:</span>
                            <span className="font-medium text-gray-900">{line.split(':')[1]}</span>
                          </div>
                        ))}
                      </div>
                      {data.notas.split(' | ')[1] && (
                        <div className="text-xs text-gray-600 mt-2">
                          Nota: {data.notas.split(' | ')[1]}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-xs mb-1">Notas:</span>
                      <span className="font-medium text-gray-900 text-sm">{data.notas}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium text-gray-900">{formatDate(data.fecha)}</span>
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">TOTAL:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.monto)}
                </span>
              </div>
            </div>

            {/* Mensaje de agradecimiento */}
            <div className="mt-6 text-center text-xs text-gray-500">
              ¡Gracias por tu pago! 🎉
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="border-t p-4 bg-gray-50">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleDownload}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Descargar</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
            >
              <ClipboardDocumentIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Copiar</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
              disabled={!data.telefonoSocio}
            >
              <PaperAirplaneIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
