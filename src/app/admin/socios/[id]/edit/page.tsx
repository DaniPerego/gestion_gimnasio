import EditForm from '@/components/socios/edit-form';
import { fetchSocioById } from '@/lib/data-socios-single';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const socio = await fetchSocioById(id);

  if (!socio) {
    notFound();
  }

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Editar Socio</h1>
      </div>
      <EditForm socio={socio} />
    </main>
  );
}
