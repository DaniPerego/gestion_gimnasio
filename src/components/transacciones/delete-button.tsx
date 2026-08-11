'use client';

import { deleteTransaccion } from '@/lib/actions-transacciones';

export default function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      await deleteTransaccion(id);
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
