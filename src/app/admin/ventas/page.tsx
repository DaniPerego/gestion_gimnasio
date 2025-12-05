import { getProductos } from '@/actions/productos-actions';
import PosInterface from '@/components/ventas/pos-interface';

export default async function Page() {
  const productos = await getProductos();
  
  return (
    <main className="h-[calc(100vh-4rem)] p-4">
      <h1 className="mb-4 text-2xl font-bold">Punto de Venta</h1>
      <PosInterface initialProductos={productos} />
    </main>
  );
}
