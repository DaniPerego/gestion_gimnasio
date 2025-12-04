'use client';

import { useActionState, useState } from 'react';
import { registrarAsistencia, CheckInState } from '@/lib/actions-asistencias';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef } from 'react';

export default function CheckInForm() {
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
              className="relative block w-full rounded-md border-0 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-lg sm:leading-6 text-center tracking-widest"
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
            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-300"
          >
            {isPending ? '...' : 'Registrar'}
          </button>
        </div>
      </form>

      {/* Result Display */}
      {state.message && isVisible && (
        <div className={`rounded-md p-4 ${
          state.status === 'success' ? 'bg-green-50' : 
          state.status === 'warning' ? 'bg-orange-50' : 'bg-red-50'
        }`}>
          <div className="flex">
            <div className="shrink-0">
              {state.status === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />}
              {state.status === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" aria-hidden="true" />}
              {state.status === 'error' && <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />}
            </div>
            <div className="ml-3 w-full">
              <h3 className={`text-sm font-medium ${
                state.status === 'success' ? 'text-green-800' : 
                state.status === 'warning' ? 'text-orange-800' : 'text-red-800'
              }`}>
                {state.message}
              </h3>
              {state.socio && (
                <div className={`mt-2 text-sm ${
                    state.status === 'success' ? 'text-green-700' : 
                    state.status === 'warning' ? 'text-orange-700' : 'text-red-700'
                }`}>
                  <p className="font-bold text-lg">{state.socio.nombre} {state.socio.apellido}</p>
                  <p>
                    Estado: <span className="font-semibold">{state.socio.estadoSuscripcion}</span>
                  </p>
                  {state.socio.estadoSuscripcion === 'ACTIVA' && (
                    <p>Vence en: {state.socio.diasVencimiento} días</p>
                  )}
                  
                  {/* Botón de WhatsApp si hay advertencia o error y el socio tiene teléfono */}
                  {(state.status === 'warning' || state.status === 'error') && state.socio.telefono && (
                    <div className="mt-4">
                      <a
                        href={`https://wa.me/${state.socio.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                          state.status === 'warning' 
                            ? `Hola ${state.socio.nombre}, te recordamos que tu cuota vence en ${state.socio.diasVencimiento} días. ¡Te esperamos!`
                            : `Hola ${state.socio.nombre}, tu cuota ha vencido. Por favor acércate a regularizar tu situación.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${
                            state.status === 'warning' 
                            ? 'bg-orange-600 hover:bg-orange-500 focus-visible:outline-orange-600' 
                            : 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600'
                        }`}
                      >
                        <svg className="-ml-0.5 mr-1.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.683-2.031-9.667-.272-.099-.47-.149-.669-.149-.198 0-.42.001-.643.001-.223 0-.586.085-.892.41-.307.325-1.177 1.147-1.177 2.798 0 1.651 1.202 3.243 1.369 3.466.166.223 2.365 3.612 5.731 5.063 2.395 1.032 2.883.827 3.378.777.495-.05 1.584-.646 1.807-1.27.223-.624.223-1.159.156-1.271z" />
                        </svg>
                        Enviar WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
