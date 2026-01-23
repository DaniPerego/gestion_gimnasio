'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface FilterOption {
  value: string;
  label: string;
}

interface StatusFilterProps {
  filterKey: string;
  options: FilterOption[];
  placeholder?: string;
}

export default function StatusFilter({ filterKey, options, placeholder = 'Todos' }: StatusFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilter = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    
    if (value && value !== 'all') {
      params.set(filterKey, value);
    } else {
      params.delete(filterKey);
    }
    
    replace(`${pathname}?${params.toString()}`);
  };

  const currentFilter = searchParams.get(filterKey) || 'all';

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentFilter}
        onChange={(e) => handleFilter(e.target.value)}
        className="block rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      >
        <option value="all">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
