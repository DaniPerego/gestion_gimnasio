'use client';

import { useRouter } from 'next/navigation';
import { TransaccionesDB } from '@/lib/db';

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      TransaccionesDB.delete({ id });
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
    >
      Eliminar
    </button>
  );
}
