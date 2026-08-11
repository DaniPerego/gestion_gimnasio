'use client';

import React, { useState, useEffect } from 'react';

type IngresosPorDiaData = {
  dia: number;
  monto: number;
};

type TransaccionDetallada = {
  id: string;
  monto: number;
  fecha: Date;
  metodoPago: string;
  notas: string;
  socioNombre: string;
};

export function IngresosPorDia() {
  const [año, setAño] = useState<number>(new Date().getFullYear());
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ingresos, setIngresos] = useState<IngresosPorDiaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [transacciones, setTransacciones] = useState<TransaccionDetallada[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const meses = [
    { num: 1, nombre: 'Enero' },
    { num: 2, nombre: 'Febrero' },
    { num: 3, nombre: 'Marzo' },
    { num: 4, nombre: 'Abril' },
    { num: 5, nombre: 'Mayo' },
    { num: 6, nombre: 'Junio' },
    { num: 7, nombre: 'Julio' },
    { num: 8, nombre: 'Agosto' },
    { num: 9, nombre: 'Septiembre' },
    { num: 10, nombre: 'Octubre' },
    { num: 11, nombre: 'Noviembre' },
    { num: 12, nombre: 'Diciembre' },
  ];

  // Obtener ingresos por día
  useEffect(() => {
    const fetchIngresos = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/reportes/ingresos-por-dia?año=${año}&mes=${mes}`
        );
        if (response.ok) {
          const data = await response.json();
          setIngresos(data);
          setDiaSeleccionado(null);
          setTransacciones([]);
        }
      } catch (error) {
        console.error('Error al obtener ingresos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIngresos();
  }, [año, mes]);

  // Obtener transacciones del día seleccionado
  const handleSelectDia = async (dia: number) => {
    if (diaSeleccionado === dia) {
      setDiaSeleccionado(null);
      setTransacciones([]);
      return;
    }

    setDiaSeleccionado(dia);
    setCargandoDetalle(true);
    try {
      const response = await fetch(
        `/api/reportes/transacciones-por-dia?año=${año}&mes=${mes}&dia=${dia}`
      );
      if (response.ok) {
        const data = await response.json();
        setTransacciones(data);
      }
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const totalMes = ingresos.reduce((sum, item) => sum + item.monto, 0);
  const totalDiaSeleccionado = transacciones.reduce((sum, t) => sum + t.monto, 0);

  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Ingresos por Día</h2>
      
      {/* Selectores */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Año
          </label>
          <select
            value={año}
            onChange={(e) => setAño(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Mes
          </label>
          <select
            value={mes}
            onChange={(e) => setMes(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {meses.map((m) => (
              <option key={m.num} value={m.num}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Total del mes */}
      {ingresos.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total del mes</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
            }).format(totalMes)}
          </p>
        </div>
      )}

      {/* Tabla de ingresos por día */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <tr>
              <th className="px-8 py-3 font-semibold text-center">📅 Día</th>
              <th className="px-12 py-3 font-semibold text-center">💰 Ingreso</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700">
            {loading ? (
              <tr>
                <td colSpan={2} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                  Cargando...
                </td>
              </tr>
            ) : ingresos.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              ingresos.map((item) => (
                <React.Fragment key={item.dia}>
                  <tr 
                    onClick={() => handleSelectDia(item.dia)}
                    className={`border-b border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 ${
                      diaSeleccionado === item.dia 
                        ? 'bg-white dark:bg-gray-700 shadow-inner' 
                        : 'bg-blue-500 dark:bg-blue-600 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <td className={`px-8 py-4 text-center font-semibold text-base transition-colors duration-200 ${
                      diaSeleccionado === item.dia
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-white group-hover:text-gray-900'
                    }`}
                    style={{
                      color: diaSeleccionado === item.dia ? undefined : 'white'
                    }}
                    onMouseEnter={(e) => {
                      if (diaSeleccionado !== item.dia) {
                        e.currentTarget.style.color = '#111827'; // gray-900
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (diaSeleccionado !== item.dia) {
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    >
                      {item.dia}
                    </td>
                    <td className={`px-12 py-4 text-center font-bold text-lg transition-colors duration-200 ${
                      diaSeleccionado === item.dia
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-white'
                    }`}
                    style={{
                      color: diaSeleccionado === item.dia ? undefined : 'white'
                    }}
                    onMouseEnter={(e) => {
                      if (diaSeleccionado !== item.dia) {
                        e.currentTarget.style.color = '#059669'; // green-600
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (diaSeleccionado !== item.dia) {
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    >
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      }).format(item.monto)}
                    </td>
                  </tr>

                  {/* Detalle del día seleccionado */}
                  {diaSeleccionado === item.dia && (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-600 dark:to-gray-700">
                        {cargandoDetalle ? (
                          <div className="text-center text-gray-600 dark:text-gray-300">Cargando transacciones...</div>
                        ) : transacciones.length === 0 ? (
                          <div className="text-center text-gray-600 dark:text-gray-300">No hay transacciones en este día</div>
                        ) : (
                          <div className="space-y-4">
                            <div className="mb-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border-2 border-green-300 dark:border-green-700 shadow-md">
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">📊 Total del día {item.dia}</p>
                              <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                                {new Intl.NumberFormat('es-AR', {
                                  style: 'currency',
                                  currency: 'ARS',
                                }).format(totalDiaSeleccionado)}
                              </p>
                            </div>

                            <div className="overflow-x-auto rounded-lg shadow-md">
                              <table className="min-w-full text-left text-sm bg-white dark:bg-gray-800">
                                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-b-2 border-gray-300 dark:border-gray-500">
                                  <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">👤 Socio</th>
                                    <th className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">💵 Monto</th>
                                    <th className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">💳 Método</th>
                                    <th className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">📝 Notas</th>
                                    <th className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">🕐 Hora</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {transacciones.map((t, index) => (
                                    <tr 
                                      key={t.id} 
                                      className={`border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                                        index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
                                      }`}
                                    >
                                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{t.socioNombre}</td>
                                      <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400">
                                        {new Intl.NumberFormat('es-AR', {
                                          style: 'currency',
                                          currency: 'ARS',
                                        }).format(t.monto)}
                                      </td>
                                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                                          {t.metodoPago}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate" title={t.notas}>{t.notas}</td>
                                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono">
                                        {new Date(t.fecha).toLocaleTimeString('es-AR', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          timeZone: 'America/Argentina/Buenos_Aires',
                                        })}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
