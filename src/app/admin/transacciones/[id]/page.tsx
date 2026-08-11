import EditForm from '@/components/transacciones/edit-form';
import { fetchTransaccionById, fetchActiveSuscripcionesForSelect } from '@/lib/data-transacciones';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  
  try {
    const [transaccion, suscripciones] = await Promise.all([
      fetchTransaccionById(id),
      fetchActiveSuscripcionesForSelect(),
    ]);

    return (
      <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Editar Transacción</h1>
        <EditForm transaccion={transaccion} suscripciones={suscripciones} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
