import EditForm from '@/components/socios/edit-form';
import CuentaCorrienteCard from '@/components/socios/cuenta-corriente-card';
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
