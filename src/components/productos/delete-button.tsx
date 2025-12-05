'use client';

import { deleteProducto } from '@/actions/productos-actions';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function DeleteButton({ id }: { id: string }) {
  const deleteWithId = deleteProducto.bind(null, id);

  return (
    <form action={deleteWithId}>
      <button
        type="submit"
        className="rounded-md border p-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
        title="Desactivar producto"
      >
        <TrashIcon className="w-5 text-red-500" />
      </button>
    </form>
  );
}
