import CheckInForm from '@/components/asistencias/check-in-form';
import KioscoButton from '@/components/asistencias/kiosco-button';
import { getConfiguracion } from '@/lib/data';

export default async function Page() {
  const config = await getConfiguracion();
  
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full flex justify-end mb-4">
        <KioscoButton />
      </div>
      <div className="text-center mb-8">
        {config?.logoUrl && (
            <div className="mb-6 flex justify-center">
                <img src={config.logoUrl} alt="Logo" className="h-32 object-contain" />
            </div>
        )}
        {config?.nombreGimnasio && (
            <h2 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {config.nombreGimnasio}
            </h2>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Control de Acceso
        </h1>
        <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Ingrese el DNI del socio para registrar su asistencia.
        </p>
      </div>
      
      <CheckInForm logoUrl={config?.logoUrl} nombreGimnasio={config?.nombreGimnasio} />
    </main>
  );
}
