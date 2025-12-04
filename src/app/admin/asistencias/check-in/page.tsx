import CheckInForm from '@/components/asistencias/check-in-form';
import KioscoButton from '@/components/asistencias/kiosco-button';

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full flex justify-end mb-4">
        <KioscoButton />
      </div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Control de Acceso
        </h1>
        <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Ingrese el DNI del socio para registrar su asistencia.
        </p>
      </div>
      
      <CheckInForm />
    </main>
  );
}
