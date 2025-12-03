import CheckInForm from '@/components/asistencias/check-in-form';

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Control de Acceso
        </h1>
        <p className="mt-2 text-lg leading-8 text-gray-600">
          Ingrese el DNI del socio para registrar su asistencia.
        </p>
      </div>
      
      <CheckInForm />
    </main>
  );
}
