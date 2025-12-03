import Form from '@/components/transacciones/create-form';
import { fetchActiveSuscripcionesForSelect } from '@/lib/data-transacciones';

export default async function Page() {
  const suscripciones = await fetchActiveSuscripcionesForSelect();

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl font-bold">
        Registrar Pago
      </h1>
      <Form suscripciones={suscripciones} />
    </main>
  );
}
