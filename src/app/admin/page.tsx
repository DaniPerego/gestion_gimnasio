import { fetchCardData } from '@/lib/data-dashboard';
import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { 
  UserGroupIcon, 
  BanknotesIcon, 
  ClockIcon, 
  ClipboardDocumentCheckIcon,
  PlusIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

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
      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Socios Activos</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white truncate">{numberOfSocios}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos del Mes</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white truncate">{formattedIncome}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
            <BanknotesIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vencimientos (7 días)</h3>
            <p className={`mt-2 text-3xl font-bold truncate ${expiringSubscriptions > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {expiringSubscriptions}
            </p>
          </div>
          <div className={`p-3 rounded-full ${expiringSubscriptions > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <ClockIcon className={`h-6 w-6 ${expiringSubscriptions > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Asistencias Hoy</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white truncate">{todaysAttendance}</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
            <ClipboardDocumentCheckIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="col-span-full mt-4 rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 transition-colors">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-4">
            <Link 
              href="/admin/transacciones/create" 
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 shadow-sm"
            >
                <CurrencyDollarIcon className="h-5 w-5" />
                Registrar Pago
            </Link>
            <Link 
              href="/admin/socios/create" 
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-500 shadow-sm"
            >
                <PlusIcon className="h-5 w-5" />
                Nuevo Socio
            </Link>
            <Link 
              href="/admin/asistencias/check-in" 
              className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-500 shadow-sm"
            >
                <CheckCircleIcon className="h-5 w-5" />
                Check-in Manual
            </Link>
        </div>
      </div>
    </div>
  );
}
