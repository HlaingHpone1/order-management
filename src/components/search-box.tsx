"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import useDataTableParams from "@/hooks/use-data-table-params";
import { cn } from "@/utils";

const SearchBox = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const { search, setFilter } = useDataTableParams();

  const [localSearch, setLocalSearch] = useState(search ?? "");
  const [prevSearch, setPrevSearch] = useState(search);

  if (search !== prevSearch) {
    setPrevSearch(search);
    setLocalSearch(search ?? "");
  }

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearchText = (value: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setFilter({ search: value.trim(), page: 1 });
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    debouncedSearchText(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      setFilter({ search: e.currentTarget.value.trim(), page: 1 });
    }
  };

  return (
    <div className={cn("relative max-w-48 min-w-32", className)}>
      <Input
        className="w-full rounded-lg border border-b-gray-200 bg-white pl-7 placeholder:pl-2"
        type="search"
        value={localSearch}
        placeholder={placeholder ?? "Search . . ."}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 transform text-gray-500" />
    </div>
  );
};

export default SearchBox;
