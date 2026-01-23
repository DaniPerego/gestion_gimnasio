import EditForm from '@/components/socios/edit-form';
import CuentaCorrienteCard from '@/components/socios/cuenta-corriente-card';
import { fetchSocioById } from '@/lib/data-socios-single';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const socio = await fetchSocioById(id);

  if (!socio) {
    notFound();
  }

  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar Socio</h1>
        <Link
          href={`/admin/socios/${id}/cuenta-corriente`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          💳 Gestionar Cuenta Corriente
        </Link>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario de edición - 2 columnas */}
        <div className="lg:col-span-2">
          <EditForm socio={socio} />
        </div>
        
        {/* Cuenta Corriente - 1 columna */}
        <div>
          <CuentaCorrienteCard 
            socioId={socio.id} 
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
        </div>
      </div>
    </main>
  );
}
