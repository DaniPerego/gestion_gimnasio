import { fetchSocioConCuentaCorriente } from '@/lib/data-cuenta-corriente';
import CuentaCorrienteManager from '@/components/cuenta-corriente/manager';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const socio = await fetchSocioConCuentaCorriente(id);

  if (!socio) {
    notFound();
  }

  return (
    <main>
      <div className="mb-6">
        <Link
          href="/admin/cuenta-corriente"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Volver a Cuenta Corriente
        </Link>
      </div>
      <CuentaCorrienteManager socio={socio} />
    </main>
  );
}
