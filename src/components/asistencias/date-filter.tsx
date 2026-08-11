'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function DateFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleDateChange = (date: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (date) {
      params.set('date', date);
    } else {
      params.delete('date');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <label htmlFor="date-filter" className="sr-only">
        Filtrar por fecha
      </label>
      <input
        id="date-filter"
        type="date"
        className="block w-full sm:w-auto rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 text-sm outline-2 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        onChange={(e) => handleDateChange(e.target.value)}
        defaultValue={searchParams.get('date')?.toString()}
      />
    </div>
  );
}
