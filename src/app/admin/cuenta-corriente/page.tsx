'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/ui/search-input';
import StatusFilter from '@/components/ui/status-filter';
import CuentaCorrienteTable from '@/components/cuenta-corriente/table';
import { SociosDB, CuentasCorrientesDB } from '@/lib/db';

export default function Page() {
  const router = useRouter();
  const [socios, setSocios] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData(query, filtro);
  }, [query, filtro]);

  const loadData = (q: string, f: string) => {
    setLoading(true);
    try {
      let sociosData = SociosDB.findMany({
        where: { activo: true },
        include: { cuentaCorriente: true },
        orderBy: { apellido: 'asc' },
      });

      if (q) {
        const ql = q.toLowerCase();
        sociosData = sociosData.filter((s: any) =>
          s.nombre?.toLowerCase().includes(ql) ||
          s.apellido?.toLowerCase().includes(ql) ||
          s.dni?.includes(ql)
        );
      }

      if (f === 'con-cuenta') {
        sociosData = sociosData.filter((s: any) => s.cuentaCorriente !== null);
      } else if (f === 'sin-cuenta') {
        sociosData = sociosData.filter((s: any) => s.cuentaCorriente === null);
      } else if (f === 'con-deuda') {
        sociosData = sociosData.filter((s: any) => s.cuentaCorriente && s.cuentaCorriente.saldoDeuda > 0);
      } else if (f === 'con-credito') {
        sociosData = sociosData.filter((s: any) => s.cuentaCorriente && s.cuentaCorriente.saldoCredito > 0);
      }

      setSocios(sociosData.map((s: any) => ({
        ...s,
        cuentaCorriente: s.cuentaCorriente ? {
          ...s.cuentaCorriente,
          saldoDeuda: Number(s.cuentaCorriente.saldoDeuda),
          saldoCredito: Number(s.cuentaCorriente.saldoCredito),
        } : null,
      })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSearch = (q: string) => {
    setQuery(q);
  };

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Cuenta Corriente</h1>
      </div>

      <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Gestiona deudas y créditos de manera ágil:</strong> Busca un socio, abre su cuenta corriente
          y registra movimientos. Los pagos se aplican automáticamente desde las transacciones.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <label htmlFor="search" className="sr-only">Buscar</label>
            <SearchInput placeholder="Buscar socio por nombre, apellido o DNI..." onSearch={handleSearch} />
          </div>
          <StatusFilter
            filterKey="filtro"
            options={[
              { value: 'con-cuenta', label: 'Con cuenta' },
              { value: 'sin-cuenta', label: 'Sin cuenta' },
              { value: 'con-deuda', label: 'Con deuda' },
              { value: 'con-credito', label: 'Con crédito' },
            ]}
            placeholder="Todos"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-4 text-gray-500">Cargando...</div>
      ) : (
        <CuentaCorrienteTable socios={socios} />
      )}
    </main>
  );
}
