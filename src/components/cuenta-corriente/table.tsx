'use client';

import Link from 'next/link';
import { useState } from 'react';
import { abrirCuentaCorrienteDirecto } from '@/lib/actions-cuenta-corriente';
import { useRouter } from 'next/navigation';

type Socio = {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  cuentaCorriente: {
    id: string;
    saldoDeuda: number;
    saldoCredito: number;
    estado: string;
  } | null;
};

export default function CuentaCorrienteTable({ socios }: { socios: Socio[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAbrirCuenta = async (socioId: string, nombreCompleto: string) => {
    if (!confirm(`¿Abrir cuenta corriente para ${nombreCompleto}?`)) return;

    setLoading(socioId);
    try {
      await abrirCuentaCorrienteDirecto(socioId, 'Apertura de cuenta');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Error al abrir cuenta corriente');
    } finally {
      setLoading(null);
    }
  };

  const calcularSaldoNeto = (deuda: number, credito: number) => {
    return deuda - credito;
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2 md:pt-0">
          {/* Vista Desktop */}
          <table className="hidden min-w-full text-gray-900 dark:text-white md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Socio</th>
                <th scope="col" className="px-3 py-5 font-medium">DNI</th>
                <th scope="col" className="px-3 py-5 font-medium text-center">Estado</th>
                <th scope="col" className="px-3 py-5 font-medium text-right">Deuda</th>
                <th scope="col" className="px-3 py-5 font-medium text-right">Crédito</th>
                <th scope="col" className="px-3 py-5 font-medium text-right">Saldo Neto</th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700">
              {socios.map((socio) => {
                const tieneCuenta = socio.cuentaCorriente !== null;
                const saldoNeto = tieneCuenta
                  ? calcularSaldoNeto(socio.cuentaCorriente!.saldoDeuda, socio.cuentaCorriente!.saldoCredito)
                  : 0;

                return (
                  <tr key={socio.id} className="w-full border-b dark:border-gray-600 py-3 text-sm">
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <p className="font-medium">{socio.apellido}, {socio.nombre}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{socio.dni}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-center">
                      {tieneCuenta ? (
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          socio.cuentaCorriente!.estado === 'ACTIVO'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        }`}>
                          {socio.cuentaCorriente!.estado}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {tieneCuenta ? (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          ${socio.cuentaCorriente!.saldoDeuda.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {tieneCuenta ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          ${socio.cuentaCorriente!.saldoCredito.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {tieneCuenta ? (
                        <span className={`font-bold ${
                          saldoNeto > 0 ? 'text-red-600 dark:text-red-400'
                            : saldoNeto < 0 ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          ${Math.abs(saldoNeto).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-2">
                        {tieneCuenta ? (
                          <Link
                            href={`/admin/cuenta-corriente/${socio.id}`}
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
                          >
                            Gestionar
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleAbrirCuenta(socio.id, `${socio.nombre} ${socio.apellido}`)}
                            disabled={loading === socio.id}
                            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500 disabled:bg-gray-400"
                          >
                            {loading === socio.id ? '...' : 'Abrir Cuenta'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Vista Mobile */}
          <div className="md:hidden">
            {socios.map((socio) => {
              const tieneCuenta = socio.cuentaCorriente !== null;
              const saldoNeto = tieneCuenta
                ? calcularSaldoNeto(socio.cuentaCorriente!.saldoDeuda, socio.cuentaCorriente!.saldoCredito)
                : 0;

              return (
                <div
                  key={socio.id}
                  className="mb-2 w-full rounded-md bg-white dark:bg-gray-700 p-4"
                >
                  <div className="flex items-center justify-between border-b dark:border-gray-600 pb-4">
                    <div>
                      <p className="text-sm font-medium">{socio.apellido}, {socio.nombre}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">DNI: {socio.dni}</p>
                    </div>
                    {tieneCuenta && (
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        socio.cuentaCorriente!.estado === 'ACTIVO'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                      }`}>
                        {socio.cuentaCorriente!.estado}
                      </span>
                    )}
                  </div>
                  {tieneCuenta && (
                    <div className="flex justify-between pt-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Deuda</p>
                        <p className="font-medium text-red-600 dark:text-red-400">
                          ${socio.cuentaCorriente!.saldoDeuda.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Crédito</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          ${socio.cuentaCorriente!.saldoCredito.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Saldo Neto</p>
                        <p className={`font-bold ${
                          saldoNeto > 0 ? 'text-red-600 dark:text-red-400'
                            : saldoNeto < 0 ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          ${Math.abs(saldoNeto).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="pt-4">
                    {tieneCuenta ? (
                      <Link
                        href={`/admin/cuenta-corriente/${socio.id}`}
                        className="block w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-500"
                      >
                        Gestionar
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleAbrirCuenta(socio.id, `${socio.nombre} ${socio.apellido}`)}
                        disabled={loading === socio.id}
                        className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:bg-gray-400"
                      >
                        {loading === socio.id ? '...' : 'Abrir Cuenta'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
