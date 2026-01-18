"use client";

import { Product, ProductVariant } from "@/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  FlaskConical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { useVariantModal } from "@/stores/use-variant-modal";
import { VariantModal } from "./VariantModal";
import { useDeleteModalStore } from "@/stores/useDeleteStore";
import DeleteDialog from "@/components/delete-dialog";
import { deleteVariant } from "./action";
import { toast } from "sonner";

type VariantWithProduct = ProductVariant & {
  product: { id: string; name: string };
};

interface VariantsTableProps {
  data: VariantWithProduct[];
  totalPages: number;
  allProducts: Pick<Product, "id" | "name">[];
}

export function VariantsTable({
  data,
  totalPages,
  allProducts,
}: VariantsTableProps) {
  const variantModal = useVariantModal();
  const deleteModal = useDeleteModalStore();

  const handleDelete = async () => {
    if (!deleteModal.selectedId) return;
    const result = await deleteVariant(deleteModal.selectedId);
    if (result.success) {
      toast.success(result.message);
      deleteModal.setOpen(false);
    } else {
      toast.error(result.error);
    }
  };

  const columns: ColumnDef<VariantWithProduct>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: "product.name",
      header: "Product",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm font-medium">
          {row.original.product.name}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {row.original.isTester && (
            <Badge variant="outline" className="text-xs">
              Tester
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "concentration",
      header: "Conc.",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.concentration}</Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
    },
    {
      accessorKey: "stockLevel",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.stockLevel;
        const reorder = row.original.reorderPoint;
        return (
          <span
            className={
              stock <= reorder ? "font-bold text-red-600" : "text-green-600"
            }
          >
            {stock}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => variantModal.onOpen(row.original)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
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
      <div className="flex justify-end">
        <Button onClick={() => variantModal.onOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Add Variant
        </Button>
      </div>

      <DataTable columns={columns} data={data} totalPages={totalPages} />

      <VariantModal products={allProducts} />
      <DeleteDialog
        title="Delete Variant"
        description="This will permanently delete this variant."
        handleDelete={handleDelete}
      />
    </div>
  );
}
