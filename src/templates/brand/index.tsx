"use client";

import { Brand } from "@/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { useBrandModal } from "@/stores/use-brand-modal";
import SearchBox from "@/components/search-box"; // Your search component
import { DataTable } from "@/components/data-table";
import { BrandModal } from "@/templates/brand/BrandModal";
import { useDeleteModalStore } from "@/stores/useDeleteStore";
import DeleteDialog from "@/components/delete-dialog";
import { deleteBrand } from "@/templates/brand/action";
import { toast } from "sonner";

interface BrandsTableProps {
  data: (Brand & { _count: { products: number } })[];
  totalPages: number;
}

export function BrandsTable({ data, totalPages }: BrandsTableProps) {
  const brandModal = useBrandModal();

  const deleteModal = useDeleteModalStore();

  const handleDeleteBrand = async () => {
    if (!deleteModal.selectedId) return;

    const result = await deleteBrand(deleteModal.selectedId);
    if (result.success) {
      toast.success(result.message);
      deleteModal.setOpen(false);
    } else {
      toast.error(result.error);
    }
  };

  const columns: ColumnDef<Brand & { _count: { products: number } }>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => row.original.country || "-",
    },
    {
      accessorKey: "_count.products",
      header: "Products",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {row.original._count.products}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => brandModal.onOpen(row.original)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  deleteModal.setOpen(true);
                  deleteModal.setSelectedId(row.original.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchBox placeholder="Search brands..." className="w-[300px]" />
        <Button onClick={() => brandModal.onOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Add Brand
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        noDataText="No brands found."
        totalPages={totalPages}
      />

      <BrandModal />

      <DeleteDialog
        title="Delete Brand"
        description="Are u sure to delete this brand"
        handleDelete={handleDeleteBrand}
      />
    </div>
  );
}
