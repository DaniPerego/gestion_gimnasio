'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function DisciplineFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilter = (term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset page when filtering
    if (term) {
      params.set('discipline', term);
    } else {
      params.delete('discipline');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const currentFilter = searchParams.get('discipline');

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">Filtrar por:</span>
      <button
        onClick={() => handleFilter('')}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
          !currentFilter
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Todos
      </button>
      <button
        onClick={() => handleFilter('musculacion')}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
          currentFilter === 'musculacion'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Musculación
      </button>
      <button
        onClick={() => handleFilter('crossfit')}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
          currentFilter === 'crossfit'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Crossfit
      </button>
    </div>
  );
}
