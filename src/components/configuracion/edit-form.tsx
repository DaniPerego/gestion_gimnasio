'use client';

import { useActionState, useState } from 'react';
import { updateConfiguracion } from '@/lib/actions-configuracion';
import { Configuracion } from '@prisma/client';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface FormState {
  message?: string;
  errors?: {
    nombreGimnasio?: string[];
    colorPrimario?: string[];
    colorSecundario?: string[];
    logoUrl?: string[];
    fondoUrl?: string[];
  };
}

export default function ConfigForm({ config }: { config: Configuracion | null }) {
  const initialState: FormState = { message: '', errors: {} };
  const [state, dispatch, isPending] = useActionState(updateConfiguracion, initialState);
  
  // Estado para manejar la previsualización de la imagen de fondo
  const [previewUrl, setPreviewUrl] = useState<string | null>(config?.fondoUrl || null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Estado para importación de BD
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    details?: any;
  }>({ type: null, message: '' });
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);

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

  // Manejar selección de archivo para importación
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        setImportStatus({
          type: 'error',
          message: 'Por favor selecciona un archivo JSON válido.',
        });
        return;
      }
      setSelectedImportFile(file);
      setImportStatus({ type: null, message: '' });
    }
  };

  // Ejecutar importación
  const handleImportDatabase = async () => {
    if (!selectedImportFile) return;

    setIsImporting(true);
    setShowImportConfirm(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedImportFile);

      const response = await fetch('/admin/configuracion/import-db', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setImportStatus({
          type: 'error',
          message: result.error || 'Error al importar la base de datos.',
          details: result.details,
        });
      } else {
        setImportStatus({
          type: 'success',
          message: 'Base de datos importada correctamente',
          details: result.importedCount,
        });
        setSelectedImportFile(null);
        const importInput = document.getElementById('import-file') as HTMLInputElement;
        if (importInput) importInput.value = '';
      }
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Error al procesar el archivo de importación.',
        details: error,
      });
    } finally {
      setIsImporting(false);
    }
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

        {/* Sección Importación de Base de Datos */}
        <div className="mt-6 border-t pt-6">
          <h3 className="mb-4 text-lg font-semibold">Importar Base de Datos</h3>
          <p className="mb-4 text-sm text-gray-600">
            Carga un archivo JSON previamente exportado para restaurar los datos del gimnasio.
          </p>

          {/* Área de carga de archivo */}
          <div className="rounded-md border-2 border-dashed border-gray-300 bg-white p-6 text-center">
            <ArrowUpTrayIcon className="mx-auto h-8 w-8 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="import-file" className="relative cursor-pointer">
                <span className="font-medium text-blue-600 hover:text-blue-500">Selecciona un archivo</span>
                <input
                  id="import-file"
                  name="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImportFileChange}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">o arrastra y suelta</p>
            </div>
            <p className="mt-2 text-xs text-gray-500">Archivos JSON únicamente</p>

            {selectedImportFile && (
              <div className="mt-4 rounded-md bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-900">
                  ✓ {selectedImportFile.name}
                </p>
              </div>
            )}
          </div>

          {/* Botón de importación */}
          {selectedImportFile && (
            <button
              type="button"
              onClick={() => setShowImportConfirm(true)}
              disabled={isImporting}
              className="mt-4 flex h-10 items-center rounded-lg bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:opacity-50"
            >
              {isImporting ? 'Importando...' : 'Importar Base de Datos'}
            </button>
          )}

          {/* Modal de confirmación */}
          {showImportConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="rounded-lg bg-white p-6 shadow-lg max-w-sm mx-4">
                <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-amber-600" />
                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  Confirmar importación
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Esta acción importará datos del archivo seleccionado. ¿Estás seguro?
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowImportConfirm(false)}
                    className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleImportDatabase}
                    disabled={isImporting}
                    className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    {isImporting ? 'Importando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mensajes de estado */}
          {importStatus.type === 'success' && (
            <div className="mt-4 rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">{importStatus.message}</p>
                  {importStatus.details && (
                    <ul className="mt-2 text-sm text-green-800 space-y-1">
                      {Object.entries(importStatus.details).map(([key, value]) => (
                        <li key={key}>
                          • {key}: {String(value)} registros
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {importStatus.type === 'error' && (
            <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">{importStatus.message}</p>
                  {importStatus.details && (
                    <p className="mt-1 text-sm text-red-800">
                      {typeof importStatus.details === 'string'
                        ? importStatus.details
                        : JSON.stringify(importStatus.details)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-between gap-4">
        <div className="flex gap-2">
          <a
            href="/admin/configuracion/export-db"
            download
            className="flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            📥 Exportar BD
          </a>
        </div>
        <button type="submit" aria-disabled={isPending} className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {isPending ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  );
}
