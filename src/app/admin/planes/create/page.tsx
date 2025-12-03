import Form from '@/components/planes/create-form';

export default function Page() {
  return (
    <main>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Crear Nuevo Plan</h1>
      </div>
      <Form />
    </main>
  );
}
