'use client';

import React, {  useRef } from 'react';
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
  const [isCopying, setIsCopying] = React.useState(false);
  // Fecha actual para mostrar en el ticket (hora de impresión/generación)
  const [currentDateTime] = React.useState(new Date());

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  // Formatear fecha para el mensaje (Fecha del pago en UTC + Hora actual)
  const formatMessageDate = (paymentDate: Date) => {
    const dateStr = new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'long',
      timeZone: 'UTC', // Evitamos el offset de zona horaria
    }).format(new Date(paymentDate));

    const timeStr = new Intl.DateTimeFormat('es-AR', {
      timeStyle: 'short',
    }).format(currentDateTime); // Usamos la hora actual

    return `${dateStr} a las ${timeStr}`;
  };

  const handleCopyToClipboard = async () => {
    if (!ticketRef.current) return;
    setIsCopying(true);
    try {
      // Generar canvas
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, 
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      // Convertir a Blob (Promisificado para mejor control de errores)
      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) throw new Error("Falló la conversión a imagen");

      try {
        // Intentar copiar al portapapeles
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        alert('¡Ticket copiado al portapapeles! 📋\n\nVe a WhatsApp y presiona Ctrl + V (Pegar).');
      } catch (clipboardError) {
        console.warn('Falló el portapapeles, usando descarga como fallback:', clipboardError);
        // PLAN B: Descargar la imagen si falla el portapapeles
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
      alert("El socio no tiene número de teléfono registrado.");
      return;
    }

    // Limpiar el número de teléfono (quitar caracteres no numéricos)
    const cleanPhone = data.telefonoSocio.replace(/\D/g, '');
    
    // Asumimos código de país si no está presente (ej. +54 para Argentina)
    // Esto es opcional, depende de cómo guardes los teléfonos.
    // Si guardas sin 549, podrías necesitar agregarlo.
    // const finalPhone = cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`;
    const finalPhone = cleanPhone; // Usamos directo lo que venga por ahora

    const message = `Hola ${data.socioNombre}! 👋\n\nAdjunto te envío el comprobante de pago.\n\nFecha: ${formatMessageDate(data.fecha)}\nMonto: ${formatCurrency(data.monto)}\n\n¡Gracias por entrenar con nosotros! 💪`;

    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header del Modal */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-700">Comprobante de Pago</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo Scrollable */}
        <div className="p-6 overflow-y-auto bg-gray-100 flex justify-center">
            {/* TICKET VISUAL - Este es el div que se convierte en imagen 
                IMPORTANTE: Usamos estilos inline con códigos HEX para asegurar
                que html2canvas pueda leer los colores correctamente, ya que
                a veces falla con las variables CSS modernas de Tailwind.
            */}
            <div 
              ref={ticketRef} 
              className="w-[340px] p-5 border text-center relative"
              style={{ 
                fontFamily: 'monospace',
                backgroundColor: '#ffffff',
                borderColor: '#e5e7eb',
                color: '#1f2937'
              }}
            >
              {/* Decoración superior */}
              <div className="mb-4 pb-4 border-b-2 border-dashed" style={{ borderColor: '#d1d5db' }}>
                <h2 className="text-2xl font-bold uppercase tracking-wider mb-1" style={{ color: '#1f2937' }}>Bendito Cross</h2>
                <p className="text-sm font-medium" style={{ color: '#4b5563' }}>Funcional Cross y Musculación</p>
              </div>

              <div className="space-y-4 text-left">
                {/* SOCIO + PLAN (Ex Concepto) */}
                <div className="flex justify-between items-start">
                    <div className="w-2/3">
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Socio</p>
                        <p className="font-bold text-lg leading-snug break-words" style={{ color: '#1f2937' }}>{data.socioNombre}</p>
                        <p className="text-xs font-medium uppercase mt-1" style={{ color: '#6b7280' }}>
                           {data.planNombre}
                        </p>
                    </div>
                    <div className="w-1/3 text-right pt-1">
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Fecha</p>
                        <p className="text-xs font-medium" style={{ color: '#4b5563' }}>
                          {new Date(data.fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                        </p>
                        <p className="text-[10px]" style={{ color: '#9ca3af' }}>
                          {currentDateTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="border-t border-dashed my-2" style={{ borderColor: '#e5e7eb' }}></div>

                {/* MÉTODO + MONTO */}
                <div className="flex justify-between items-center py-2">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#9ca3af' }}>Método</p>
                        <p className="font-bold uppercase text-sm px-2 py-1 rounded border inline-block" style={{ color: '#374151', borderColor: '#d1d5db', backgroundColor: '#f9fafb' }}>
                            {data.metodoPago}
                        </p>
                    </div>
                    <div className="text-right">
                         <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#9ca3af' }}>Total</p>
                         <p className="text-3xl font-black" style={{ color: '#000000' }}>{formatCurrency(data.monto)}</p>
                    </div>
                </div>

                {/* CONCEPTO (Ex Notas) */}
                {data.notas && (
                  <>
                    <div className="border-t border-dashed my-2" style={{ borderColor: '#e5e7eb' }}></div>
                    <div className="pt-1">
                       <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#9ca3af' }}>Concepto</p>
                       <p className="font-bold text-sm italic" style={{ color: '#4b5563' }}>"{data.notas}"</p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 pt-3 border-t-2 border-dashed" style={{ borderColor: '#d1d5db' }}>
                <p className="text-[10px] mb-1" style={{ color: '#9ca3af' }}>¡Gracias por entrenar con nosotros!</p>
                <p className="text-[9px]" style={{ color: '#d1d5db' }}>ID: {data.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
        </div>

        {/* Footer con Acciones */}
        <div className="p-4 border-t bg-gray-50 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={handleOpenWhatsApp} 
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!data.telefonoSocio}
                title={!data.telefonoSocio ? "El socio no tiene teléfono" : "Abrir WhatsApp"}
             >
                <PaperAirplaneIcon className="w-4 h-4 -rotate-45" /> 
                1. WhatsApp
             </button>
             <button 
                onClick={handleCopyToClipboard} 
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer disabled:opacity-50" 
                disabled={isCopying}
             >
                {isCopying ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                2. Copiar
             </button>
          </div>
          <p className="text-xs text-center text-gray-500">
             Pasos: Toca "Abrir WhatsApp" y luego pega (Ctrl+V) la imagen en el chat.
          </p>
        </div>
      </div>
    </div>
  );
}