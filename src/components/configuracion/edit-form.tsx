'use client';

import { useActionState, useState } from 'react';
import { updateConfiguracion } from '@/lib/actions-configuracion';
import { Configuracion } from '@prisma/client';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ConfigForm({ config }: { config: Configuracion | null }) {
  const initialState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(updateConfiguracion, initialState);
  
  // Estado para manejar la previsualización de la imagen de fondo
  const [previewUrl, setPreviewUrl] = useState<string | null>(config?.fondoUrl || null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (file) {
      if (file.size > 1024 * 1024) { // 1MB límite
        setFileError('La imagen no debe superar 1MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Nombre del Gimnasio */}
        <div className="mb-4">
          <label htmlFor="nombreGimnasio" className="mb-2 block text-sm font-medium">
            Nombre del Gimnasio
          </label>
          <div className="relative">
            <input
              id="nombreGimnasio"
              name="nombreGimnasio"
              type="text"
              defaultValue={config?.nombreGimnasio || ''}
              placeholder="Mi Gimnasio"
              className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500"
              aria-describedby="nombre-error"
            />
          </div>
          <div id="nombre-error" aria-live="polite" aria-atomic="true">
            {state.errors?.nombreGimnasio &&
              state.errors.nombreGimnasio.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Color Primario */}
        <div className="mb-4">
          <label htmlFor="colorPrimario" className="mb-2 block text-sm font-medium">
            Color Primario (Sidebar)
          </label>
          <div className="flex items-center gap-4">
            <input
              id="colorPrimario"
              name="colorPrimario"
              type="color"
              defaultValue={config?.colorPrimario || '#000000'}
              className="h-10 w-20 cursor-pointer rounded border border-gray-200 p-1"
            />
            <input 
                type="text" 
                readOnly 
                value={config?.colorPrimario || '#000000'} // Simple display, ideally synced with state but defaultValue works for SSR
                className="rounded-md border border-gray-200 py-2 pl-3 text-sm text-gray-500"
            />
          </div>
           <div id="colorPrimario-error" aria-live="polite" aria-atomic="true">
            {state.errors?.colorPrimario &&
              state.errors.colorPrimario.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Color Secundario */}
        <div className="mb-4">
          <label htmlFor="colorSecundario" className="mb-2 block text-sm font-medium">
            Color Secundario (Logo/Acentos)
          </label>
          <div className="flex items-center gap-4">
            <input
              id="colorSecundario"
              name="colorSecundario"
              type="color"
              defaultValue={config?.colorSecundario || '#ffffff'}
              className="h-10 w-20 cursor-pointer rounded border border-gray-200 p-1"
            />
             <input 
                type="text" 
                readOnly 
                value={config?.colorSecundario || '#ffffff'}
                className="rounded-md border border-gray-200 py-2 pl-3 text-sm text-gray-500"
            />
          </div>
          <div id="colorSecundario-error" aria-live="polite" aria-atomic="true">
            {state.errors?.colorSecundario &&
              state.errors.colorSecundario.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Imagen de Fondo (File Upload) */}
        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium text-gray-900">
            Imagen de Fondo (Opcional)
          </span>
          
          {/* Hidden input to send the Base64 string to the server */}
          <input type="hidden" name="fondoUrl" value={previewUrl || ''} />

          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 bg-white">
            <div className="text-center">
              {previewUrl ? (
                <div className="relative inline-block">
                  <img 
                    src={previewUrl} 
                    alt="Vista previa" 
                    className="mx-auto h-48 object-cover rounded-md shadow-md" 
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
              )}
              
              <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                >
                  <span>Subir un archivo</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">o arrastrar y soltar</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF hasta 1MB</p>
              {fileError && <p className="text-sm text-red-500 mt-2">{fileError}</p>}
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Esta imagen se mostrará detrás del nombre del gimnasio en el menú lateral.
          </p>
        </div>

        <div aria-live="polite" aria-atomic="true">
            {state.message && (
                <p className={`mt-2 text-sm ${state.message.includes('correctamente') ? 'text-green-600' : 'text-red-500'}`} key={state.message}>
                    {state.message}
                </p>
            )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <a
          href="/admin/configuracion/export-db"
          download
          className="flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          Exportar Base de Datos
        </a>
        <button type="submit" aria-disabled={isPending} className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {isPending ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  );
}
