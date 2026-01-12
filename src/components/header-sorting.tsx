import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Column } from "@tanstack/react-table";
import useDataTableParams from "@/hooks/use-data-table-params";

interface HeaderSortingProps<TData> {
  column: Column<TData, unknown>;
  title: string;
}

export const HeaderSorting = <TData,>({
  column,
  title,
}: HeaderSortingProps<TData>) => {
  const { setFilter } = useDataTableParams();

  const handleSort = () => {
    const isAsc = column.getIsSorted() === "asc";
    const nextSortOrder = isAsc ? "desc" : "asc";

    column.toggleSorting(isAsc);

    setFilter({ sortOrder: nextSortOrder, sortBy: column.id });
  };
  return (
    <Button
      variant="ghost"
      className="ps-0 hover:bg-transparent"
      onClick={() => handleSort()}
    >
      {title}
      <ArrowUpDown />
    </Button>
  );
};
