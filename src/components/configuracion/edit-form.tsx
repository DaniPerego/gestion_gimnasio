'use client';

import { useActionState, useState, useEffect } from 'react';
import { updateConfiguracion } from '@/lib/actions-configuracion';
import { Configuracion } from '@/lib/db';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ConfigForm({ config }: { config: Configuracion | null }) {
  const initialState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(updateConfiguracion, initialState);
  
  // Estado para manejar la previsualización de la imagen
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
    // Limpiar el input file si es necesario (opcional, ya que usamos hidden input para el valor real)
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <>
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4 md:p-6">
        {/* Nombre del Gimnasio */}
        <div className="mb-4">
          <label htmlFor="nombreGimnasio" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Nombre del Gimnasio
          </label>
          <div className="relative">
            <input
              id="nombreGimnasio"
              name="nombreGimnasio"
              type="text"
              defaultValue={config?.nombreGimnasio || ''}
              placeholder="Mi Gimnasio"
              className="peer block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-2 pl-3 text-sm outline-2 placeholder:text-gray-500 dark:placeholder:text-gray-400"
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
          <label htmlFor="colorPrimario" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Color Primario (Sidebar)
          </label>
          <div className="flex items-center gap-4">
            <input
              id="colorPrimario"
              name="colorPrimario"
              type="color"
              defaultValue={config?.colorPrimario || '#000000'}
              className="h-10 w-20 cursor-pointer rounded border border-gray-300 dark:border-gray-600 p-1"
            />
            <input 
                type="text" 
                readOnly 
                value={config?.colorPrimario || '#000000'} // Simple display, ideally synced with state but defaultValue works for SSR
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 text-sm text-gray-900 dark:text-gray-100"
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
          <label htmlFor="colorSecundario" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Color Secundario (Fondo Principal)
          </label>
          <div className="flex items-center gap-4">
            <input
              id="colorSecundario"
              name="colorSecundario"
              type="color"
              defaultValue={config?.colorSecundario || '#ffffff'}
              className="h-10 w-20 cursor-pointer rounded border border-gray-300 dark:border-gray-600 p-1"
            />
             <input 
                type="text" 
                readOnly 
                value={config?.colorSecundario || '#ffffff'}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 text-sm text-gray-900 dark:text-gray-100"
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
          <span className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            Logo del Gimnasio (Opcional)
          </span>
          
          {/* Hidden input to send the Base64 string to the server */}
          <input type="hidden" name="fondoUrl" value={previewUrl || ''} />

          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-6 py-10 bg-white dark:bg-gray-700">
            <div className="text-center">
              {previewUrl ? (
                <div className="relative inline-block">
                  <img 
                    src={previewUrl} 
                    alt="Vista previa" 
                    className="mx-auto h-48 w-48 object-contain rounded-md" 
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              )}
              
              <div className="mt-4 flex flex-col sm:flex-row text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center items-center gap-1">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-transparent font-semibold text-blue-600 dark:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500 dark:hover:text-blue-300"
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
                <p className="hidden sm:inline">o arrastrar y soltar</p>
              </div>
              <p className="text-xs leading-5 text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF hasta 1MB</p>
              {fileError && <p className="text-sm text-red-500 mt-2">{fileError}</p>}
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Esta imagen se mostrará como logo del gimnasio en el menú lateral y como ícono de la aplicación.
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
      
      {/* Botón Guardar Configuración */}
      <div className="mt-6 flex justify-end">
        <button 
          type="submit" 
          disabled={isPending}
          className="flex h-10 items-center justify-center rounded-lg bg-[var(--primary-color)] px-6 text-sm font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
    
    {/* Sección de Backup/Restore */}
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Backup y Restauración</h2>
      
      {/* Exportar Base de Datos */}
      <div className="mb-6">
        <a
          href="/admin/configuracion/export-db"
          download
          className="inline-flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          📥 Exportar Base de Datos
        </a>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Descarga una copia completa de tu base de datos en formato JSON.</p>
      </div>

      {/* Importar Backup con Advertencia */}
      <div>
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Importar Backup</h3>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong className="font-semibold">¡Advertencia!</strong> Importar un backup <strong>sobrescribirá completamente</strong> todos los datos actuales de la base de datos.
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                Esta acción <span className="font-bold">no se puede deshacer</span>. Asegúrate de tener un backup actualizado antes de continuar.
              </p>
            </div>
          </div>
        </div>
        
        <form
          action="/admin/configuracion/import-db"
          method="POST"
          encType="multipart/form-data"
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
          onSubmit={(e) => {
            if (!window.confirm('⚠️ ¿Estás SEGURO de que deseas importar este backup?\n\nEsto ELIMINARÁ todos los datos actuales y los reemplazará con el contenido del archivo.\n\n✅ Confirma solo si entiendes las consecuencias.')) {
              e.preventDefault();
            }
          }}
        >
          <input
            type="file"
            name="file"
            accept="application/json"
            required
            className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 cursor-pointer"
          />
          <button
            type="submit"
            className="flex-shrink-0 flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap"
          >
            📤 Importar Backup
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
