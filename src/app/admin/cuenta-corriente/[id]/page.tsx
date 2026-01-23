import { fetchSocioConCuentaCorriente } from '@/lib/data-cuenta-corriente';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CuentaCorrienteManager from '@/components/cuenta-corriente/manager';

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
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver a Cuenta Corriente
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cuenta Corriente</h1>
        <p className="text-sm text-muted-foreground">
          {socio.nombre} {socio.apellido} - DNI: {socio.dni}
        </p>
      </div>

      <CuentaCorrienteManager
        socioId={socio.id}
        socioNombre={`${socio.nombre} ${socio.apellido}`}
        cuentaCorriente={socio.cuentaCorriente}
      />
    </main>
  );
}
