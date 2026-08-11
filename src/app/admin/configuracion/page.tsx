'use client';

import ConfigForm from '@/components/configuracion/edit-form';
import { useEffect, useState } from 'react';
import { ConfiguracionDB } from '@/lib/db';

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const c = ConfiguracionDB.findFirst();
    setConfig(c);
  }, []);

  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Configuración del Sistema (White-Label)</h1>
      </div>
      <div className="max-w-2xl">
        <ConfigForm config={config} />
      </div>
    </main>
  );
}
