import { fetchSocioById } from '@/lib/data-socios-single';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CuentaCorrienteManager from '@/components/socios/cuenta-corriente-manager';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const socio = await fetchSocioById(id);

  if (!socio) {
    notFound();
  }

  return (
    <main>
      <div className="mb-6">
        <Link
          href={`/admin/socios/${id}/edit`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver al perfil de {socio.nombre} {socio.apellido}
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
        cuentaCorriente={socio.cuentaCorriente ? {
          ...socio.cuentaCorriente,
          saldoDeuda: socio.cuentaCorriente.saldoDeuda.toNumber(),
          saldoCredito: socio.cuentaCorriente.saldoCredito.toNumber(),
          movimientos: socio.cuentaCorriente.movimientos.map(m => ({
            ...m,
            monto: m.monto.toNumber(),
          }))
        } : null}
      />
    </main>
  );
}
