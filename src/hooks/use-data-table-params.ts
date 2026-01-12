"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Search = {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

const useDataTableParams = () => {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const search = searchParams.get("search")
    ? (searchParams.get("search") as string)
    : undefined;

  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page") as string)
    : undefined;

  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit") as string)
    : undefined;

  const sortBy = searchParams.get("sort")
    ? (searchParams.get("sort") as string)
    : undefined;
  const sortOrder = searchParams.get("direction")
    ? (searchParams.get("direction") as string)
    : undefined;

  const setFilter = useCallback(
    (filters: Search) => {
      const params = new URLSearchParams(searchParams.toString());

      if (filters.search !== null && filters.search !== undefined) {
        params.set("search", filters.search);
      }

      if (filters.page !== null && filters.page !== undefined) {
        params.set("page", filters.page.toString());
      }

      if (filters.limit !== null && filters.limit !== undefined) {
        params.set("limit", filters.limit.toString());
      }

      if (filters.sortBy !== undefined) {
        params.set("sort", filters.sortBy.toLowerCase());
      }

      if (filters.sortOrder !== undefined) {
        params.set("direction", filters.sortOrder);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return { search, page, limit, sortBy, sortOrder, setFilter };
};

export default useDataTableParams;
