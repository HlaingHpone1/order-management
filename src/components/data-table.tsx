"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import CustomPagination from "@/components/custom-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  noDataText?: string;
  className?: string;
  cellClassName?: string;
  totalPages?: number;
  maxContent?: boolean;
  initialHiddenColumns?: VisibilityState;
  hidePagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  noDataText,
  className,
  totalPages,
  cellClassName,
  maxContent = false,
  initialHiddenColumns = {},
  hidePagination = false,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations();

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility: initialHiddenColumns,
    },
  });

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
        <Table
          wrapperClassName={cn(
            !maxContent && "h-[calc(100vh-250px)]",
            className,
            "bg-white",
          )}
          className={cn(isLoading && "h-full")}
        >
          <TableHeader className="bg-primary sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-primary" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className={cn(
                      "font-medium text-white",
                      header.column.columnDef.meta?.headerClassName,
                    )}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          {isLoading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <LoaderCircle className="text-muted-foreground mx-auto size-10 animate-spin" />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "whitespace-nowrap",
                          cell.column.columnDef.meta?.cellClassName,
                          cellClassName,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-white">
                  <TableCell
                    colSpan={columns.length}
                    className="h-[calc(100vh-450px)] text-center"
                  >
                    {noDataText ?? t("noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
      {!hidePagination && (
        <>
          <CustomPagination totalPages={totalPages ?? 1} />
        </>
      )}
    </div>
  );
}
