import EditForm from '@/components/suscripciones/edit-form';
import { fetchSuscripcionById } from '@/lib/data-suscripciones';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const suscripcion = await fetchSuscripcionById(id);

  if (!suscripcion) {
    notFound();
  }

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl font-bold">
        Editar Suscripción
      </h1>
      <EditForm suscripcion={suscripcion} />
    </main>
  );
}