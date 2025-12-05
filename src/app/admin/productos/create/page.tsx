import Form from '@/components/productos/create-form';
import Breadcrumbs from '@/components/ui/breadcrumbs';
 
export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Productos', href: '/admin/productos' },
          {
            label: 'Crear Producto',
            href: '/admin/productos/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
