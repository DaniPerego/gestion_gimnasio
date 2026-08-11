'use client';

import { useEffect, useState } from 'react';
import { fetchCardData } from '@/lib/data-dashboard';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-simple';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [cardData, setCardData] = useState<{
    numberOfSocios: number;
    totalIncome: number;
    expiringSubscriptions: number;
    todaysAttendance: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }

    fetchCardData().then(data => {
      setCardData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  if (loading || !cardData) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
  }

  const formattedIncome = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(cardData.totalIncome);

  return (
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm transition-colors">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Socios Activos</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{cardData.numberOfSocios}</p>
      </div>
      <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm transition-colors">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos del Mes</h3>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">{formattedIncome}</p>
      </div>
      <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm transition-colors">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Vencimientos Próximos</h3>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{cardData.expiringSubscriptions}</p>
      </div>
      <div className="rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm transition-colors">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Asistencias Hoy</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{cardData.todaysAttendance}</p>
      </div>

      <div className="col-span-full mt-4 rounded-xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm transition-colors">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Acciones Rápidas</h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/admin/transacciones/create" className="rounded-lg bg-blue-600 px-4 py-2 text-sm sm:text-base text-white text-center hover:bg-blue-500 transition-colors">
                Registrar Pago
            </Link>
            <Link href="/admin/socios/create" className="rounded-lg bg-green-600 px-4 py-2 text-sm sm:text-base text-white text-center hover:bg-green-500 transition-colors">
                Nuevo Socio
            </Link>
            <Link href="/admin/asistencias/check-in" className="rounded-lg bg-gray-600 px-4 py-2 text-sm sm:text-base text-white text-center hover:bg-gray-500 transition-colors">
                Check-in Manual
            </Link>
        </div>
      </div>
    </div>
  );
}
