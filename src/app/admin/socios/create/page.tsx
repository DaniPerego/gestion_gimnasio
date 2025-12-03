import Form from '@/components/socios/create-form';
import Link from 'next/link';

export default function Page() {
  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Crear Socio</h1>
      </div>
      <Form />
    </main>
  );
}
