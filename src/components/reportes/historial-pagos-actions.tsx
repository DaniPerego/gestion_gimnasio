'use client';

type HistorialPagoRow = {
  fecha: string;
  planNombre: string;
  suscripcionEstado: string;
  tipoPago: string;
  metodoPago: string;
  monto: number;
  notas: string;
};

type Props = {
  socioNombre: string;
  socioDni: string;
  rows: HistorialPagoRow[];
};

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function HistorialPagosActions({ socioNombre, socioDni, rows }: Props) {
  const handleDownloadCsv = () => {
    const header = [
      'Fecha',
      'Plan',
      'Estado suscripcion',
      'Tipo',
      'Metodo',
      'Monto',
      'Notas',
    ];

    const csvRows = rows.map((row) => [
      row.fecha,
      row.planNombre,
      row.suscripcionEstado,
      row.tipoPago,
      row.metodoPago,
      row.monto.toFixed(2),
      row.notas,
    ]);

    const csvContent = [header, ...csvRows]
      .map((columns) => columns.map((column) => escapeCsv(String(column))).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historial-pagos-${socioNombre}-${socioDni}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleDownloadCsv}
        className="h-10 rounded-lg border border-emerald-300 bg-emerald-50 px-4 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
      >
        Descargar CSV
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        Imprimir / PDF
      </button>
    </div>
  );
}