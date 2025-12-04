import { fetchCardData } from '@/lib/data-dashboard';
import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await auth();
  let userPermissions = null;
  
  if (session?.user?.email) {
    userPermissions = await prisma.usuario.findUnique({
        where: { email: session.user.email },
    });
  }
  
  const isAdmin = userPermissions?.rol === 'ADMIN' || userPermissions?.rol === 'admin';

  if (!isAdmin) {
      // Si no es admin, redirigir a la primera sección disponible (generalmente Socios)
      redirect('/admin/socios');
  }

  const {
    numberOfSocios,
    totalIncome,
    expiringSubscriptions,
    todaysAttendance,
  } = await fetchCardData();

  const formattedIncome = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(totalIncome);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Tarjetas de Resumen */}
      <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm transition-colors">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Socios Activos</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{numberOfSocios}</p>
      </div>
      <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm transition-colors">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos del Mes</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{formattedIncome}</p>
      </div>
      <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm transition-colors">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vencimientos Próximos</h3>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400 truncate">{expiringSubscriptions}</p>
      </div>
      <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm transition-colors">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Asistencias Hoy</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{todaysAttendance}</p>
      </div>

      <div className="col-span-full mt-4 rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Acciones Rápidas</h3>
        <div className="flex gap-4">
            <Link href="/admin/transacciones/create" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">
                Registrar Pago
            </Link>
            <Link href="/admin/socios/create" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-500">
                Nuevo Socio
            </Link>
            <Link href="/admin/asistencias/check-in" className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-500">
                Check-in Manual
            </Link>
        </div>
      </div>
    </div>
  );
}
