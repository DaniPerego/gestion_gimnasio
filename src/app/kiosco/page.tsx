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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 transition-colors">
      <div className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl transition-colors">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Control de Acceso</h1>
        </div>
        <CheckInForm />
      </div>
    </main>
  );
}
