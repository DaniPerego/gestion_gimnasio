import EditForm from '@/components/planes/edit-form';
import { fetchPlanById } from '@/lib/data-planes';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await fetchPlanById(id);

  if (!plan) {
    notFound();
  }

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Editar Plan</h1>
      </div>
      <EditForm plan={plan} />
    </main>
  );
}
