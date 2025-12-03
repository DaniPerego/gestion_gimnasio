'use client';

import { useActionState } from 'react';
import { registrarAsistencia, CheckInState } from '@/lib/actions-asistencias';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef } from 'react';

export default function CheckInForm() {
  const initialState: CheckInState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(registrarAsistencia, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status) {
      // Clear input on success/warning to allow next check-in
      if (formRef.current) {
        formRef.current.reset();
      }
      // Keep focus on input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [state]);

  return (
    <div className="w-full max-w-md space-y-8">
      <form ref={formRef} action={dispatch} className="mt-8 space-y-6">
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
              className="relative block w-full rounded-md border-0 py-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xl sm:leading-6 text-center tracking-widest"
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
            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-300"
          >
            {isPending ? 'Registrando...' : 'Registrar Asistencia'}
          </button>
        </div>
      </form>

      {/* Result Display */}
      {state.message && (
        <div className={`rounded-md p-4 ${
          state.status === 'success' ? 'bg-green-50' : 
          state.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
        }`}>
          <div className="flex">
            <div className="shrink-0">
              {state.status === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />}
              {state.status === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />}
              {state.status === 'error' && <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                state.status === 'success' ? 'text-green-800' : 
                state.status === 'warning' ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {state.message}
              </h3>
              {state.socio && (
                <div className={`mt-2 text-sm ${
                    state.status === 'success' ? 'text-green-700' : 
                    state.status === 'warning' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  <p className="font-bold text-lg">{state.socio.nombre} {state.socio.apellido}</p>
                  <p>
                    Estado: <span className="font-semibold">{state.socio.estadoSuscripcion}</span>
                  </p>
                  {state.socio.estadoSuscripcion === 'ACTIVA' && (
                    <p>Vence en: {state.socio.diasVencimiento} días</p>
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
