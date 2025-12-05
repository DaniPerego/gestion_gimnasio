import Form from '@/components/productos/edit-form';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { getProductoById } from '@/actions/productos-actions';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const producto = await getProductoById(id);

  if (!producto) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Productos', href: '/admin/productos' },
          {
            label: 'Editar Producto',
            href: `/admin/productos/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form producto={producto} />
    </main>
  );
}
