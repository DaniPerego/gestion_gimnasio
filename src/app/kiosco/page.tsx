import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CheckInForm from '@/components/asistencias/check-in-form';
import prisma from '@/lib/prisma';

export default async function KioscoPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Verificar permiso de asistencias
  const user = await prisma.usuario.findUnique({
    where: { email: session.user.email },
  });

  const canAccess = user?.rol === 'ADMIN' || user?.permisoAsistencias;

  if (!canAccess) {
    redirect('/admin');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Control de Acceso</h1>
          <p className="mt-2 text-gray-600">Ingrese su DNI para registrar asistencia</p>
        </div>
        <CheckInForm />
        <div className="mt-8 text-center text-sm text-gray-400">
            <p>Modo Kiosco - GMS White-Label</p>
        </div>
      </div>
    </main>
  );
}
