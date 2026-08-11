"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Option = {
  value: string;
  label: string;
};

export default function StatusFilter({
  options,
  placeholder = "Filtrar",
  filterKey = "filtro",
}: {
  options: Option[];
  placeholder?: string;
  filterKey?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentValue = searchParams.get(filterKey) || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (e.target.value) {
      params.set(filterKey, e.target.value);
      params.set("page", "1");
    } else {
      params.delete(filterKey);
      params.set("page", "1");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentValue}
      onChange={handleChange}
      className="rounded-md border border-gray-200 bg-white text-gray-900 py-2 px-3 text-sm outline-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      aria-label={placeholder}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
