import EditForm from '@/components/usuarios/edit-form';
import { fetchUsuarioById } from '@/lib/data-usuarios';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await fetchUsuarioById(id);

  if (!usuario) {
    notFound();
  }

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl font-bold">
        Editar Usuario
      </h1>
      <EditForm usuario={usuario} />
    </main>
  );
}
