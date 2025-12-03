import ConfigForm from '@/components/configuracion/edit-form';
import { getConfiguracion } from '@/lib/data';

export default async function Page() {
  const config = await getConfiguracion();

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
