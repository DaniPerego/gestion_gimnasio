'use client';

import { useActionState, useState } from 'react';
import { registrarAsistencia, CheckInState } from '@/lib/actions-asistencias';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef } from 'react';

export default function CheckInForm({ logoUrl, nombreGimnasio }: { logoUrl?: string | null, nombreGimnasio?: string }) {
  const initialState: CheckInState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(registrarAsistencia, initialState);
  const [isVisible, setIsVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status) {
      setIsVisible(true);
      
      // Clear input on success/warning to allow next check-in
      if (formRef.current) {
        formRef.current.reset();
      }
      // Keep focus on input
      if (inputRef.current) {
        inputRef.current.focus();
      }

      // Auto-hide message logic
      const duration = state.status === 'success' ? 2000 : 5000;
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <div className="w-full space-y-4">
      <form ref={formRef} action={dispatch} className="mt-4 space-y-4">
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="dni" className="sr-only">
              DNI del Socio
            </label>
            <input
              id="dni"
              name="dni"
              type="text"
              required
              ref={inputRef}
              className="relative block w-full rounded-md border-0 py-3 text-white bg-gray-800/50 ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-lg sm:leading-6 text-center tracking-widest transition-colors"
              placeholder="Ingrese DNI"
              autoComplete="off"
              autoFocus
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="group relative flex w-full justify-center rounded-md px-3 py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--primary-color)] hover:brightness-110 transition-all"
          >
            {isPending ? 'PROCESANDO...' : 'REGISTRAR'}
          </button>
        </div>
      </form>

      {/* Result Display */}
      {state.message && isVisible && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          state.status === 'success' ? 'bg-green-500' : 
          state.status === 'warning' ? 'bg-orange-500' : 'bg-red-600'
        }`}>
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl text-center transform transition-all scale-100">
            
            {/* Logo */}
            <div className="mb-6 flex justify-center">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-24 object-contain" />
                ) : (
                    <h2 className="text-2xl font-bold text-gray-800">{nombreGimnasio || 'Gimnasio'}</h2>
                )}
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="mb-4">
                {state.status === 'success' && <CheckCircleIcon className="h-24 w-24 text-green-500" aria-hidden="true" />}
                {state.status === 'warning' && <ExclamationTriangleIcon className="h-24 w-24 text-orange-500" aria-hidden="true" />}
                {state.status === 'error' && <XCircleIcon className="h-24 w-24 text-red-500" aria-hidden="true" />}
              </div>
              
              <h3 className={`text-3xl font-bold mb-2 ${
                state.status === 'success' ? 'text-green-600' : 
                state.status === 'warning' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {state.message}
              </h3>

              {state.socio && (
                <div className="mt-6 space-y-4 w-full">
                  <div className="border-t border-b border-gray-100 py-4">
                    <p className="text-4xl font-black text-gray-900 uppercase tracking-tight">
                        {state.socio.nombre} {state.socio.apellido}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        <p className={`text-xl font-bold ${
                            state.socio.estadoSuscripcion === 'ACTIVA' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {state.socio.estadoSuscripcion}
                        </p>
                      </div>
                      {state.socio.estadoSuscripcion === 'ACTIVA' && (
                        <div>
                            <p className="text-sm text-gray-500">Vencimiento</p>
                            <p className="text-xl font-bold text-gray-800">
                                {state.socio.diasVencimiento} días
                            </p>
                        </div>
                      )}
                  </div>
                  
                  {/* Botón de WhatsApp si hay advertencia o error y el socio tiene teléfono */}
                  {(state.status === 'warning' || state.status === 'error') && state.socio.telefono && (
                    <div className="mt-6">
                      <a
                        href={`https://wa.me/${state.socio.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                          state.status === 'warning' 
                            ? `Hola ${state.socio.nombre}, te recordamos que tu cuota vence en ${state.socio.diasVencimiento} días. ¡Te esperamos!`
                            : `Hola ${state.socio.nombre}, tu cuota ha vencido. Por favor acércate a regularizar tu situación.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex w-full justify-center items-center rounded-xl px-6 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 ${
                            state.status === 'warning' 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        <svg className="-ml-1 mr-3 h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.683-2.031-9.667-.272-.099-.47-.149-.669-.149-.198 0-.42.001-.643.001-.223 0-.586.085-.892.41-.307.325-1.177 1.147-1.177 2.798 0 1.651 1.202 3.243 1.369 3.466.166.223 2.365 3.612 5.731 5.063 2.395 1.032 2.883.827 3.378.777.495-.05 1.584-.646 1.807-1.27.223-.624.223-1.159.156-1.271z" />
                        </svg>
                        Enviar WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button 
                onClick={() => setIsVisible(false)}
                className="mt-8 text-sm text-gray-400 hover:text-gray-600 underline"
            >
                Cerrar (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
