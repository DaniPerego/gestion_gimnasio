"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

export default function SearchInput({ placeholder, onSearch }: { placeholder: string; onSearch?: (query: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [value, setValue] = useState(searchParams.get("query") || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (onSearch) {
      // Client-side search callback
      onSearch(newValue);
    } else {
      // URL-based search
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (newValue) {
        params.set("query", newValue);
        params.set("page", "1");
      } else {
        params.delete("query");
        params.set("page", "1");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <input
      id="search"
      className="peer block w-full rounded-md border border-gray-200 bg-white text-gray-900 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      aria-label="Buscar"
    />
  );
}
