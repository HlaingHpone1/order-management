"use client";

import {
  InventoryBatch,
  ProductVariant,
  Product,
} from "@/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table";
import { useInventoryModal } from "@/stores/use-inventory-modal";
import { InventoryModal } from "./InventoryModal";
import { useDeleteModalStore } from "@/stores/useDeleteStore";
import DeleteDialog from "@/components/delete-dialog";
import { deleteBatch } from "./action";
import { toast } from "sonner";
import { format } from "date-fns";

// Type with Relations
type BatchWithRelations = InventoryBatch & {
  variant: ProductVariant & {
    product: Product;
  };
};

// Type for Modal Dropdown
type VariantOption = {
  id: string;
  name: string;
  sku: string;
  productName: string;
};

interface InventoryTableProps {
  data: BatchWithRelations[];
  totalPages: number;
  variants: VariantOption[]; // For the add modal
}

export function InventoryTable({
  data,
  totalPages,
  variants,
}: InventoryTableProps) {
  const inventoryModal = useInventoryModal();
  const deleteModal = useDeleteModalStore();

  const handleDelete = async () => {
    if (!deleteModal.selectedId) return;
    const result = await deleteBatch(deleteModal.selectedId);
    if (result.success) {
      toast.success(result.message);
      deleteModal.setOpen(false);
    } else {
      toast.error(result.error);
    }
  };

  const columns: ColumnDef<BatchWithRelations>[] = [
    {
      accessorKey: "batchCode",
      header: "Batch #",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.batchCode}</span>
      ),
    },
    {
      id: "product",
      header: "Product / Variant",
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium">
            {row.original.variant.product.name}
          </div>
          <div className="text-muted-foreground text-xs">
            {row.original.variant.sku} - {row.original.variant.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "quantityOnHand", // 👈 FIX: Matches Schema
      header: "Qty",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.quantityOnHand}</span>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry",
      cell: ({ row }) => {
        const date = row.original.expiryDate;
        if (!date) return <span className="text-muted-foreground">-</span>;

        const isExpired = new Date(date) < new Date();
        return (
          <div
            className={`flex items-center gap-1 ${isExpired ? "font-bold text-red-600" : ""}`}
          >
            {isExpired && <AlertTriangle className="h-3 w-3" />}
            {format(new Date(date), "MMM d, yyyy")}
          </div>
        );
      },
    },
    {
      accessorKey: "costPrice",
      header: "Cost",
      cell: ({ row }) => (
        <span>${Number(row.original.costPrice).toFixed(2)}</span>
      ),
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
                onClick={() => inventoryModal.onOpen(row.original)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit Batch
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  deleteModal.setOpen(true);
                  deleteModal.setSelectedId(row.original.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete / Write-off
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
        {/* Placeholder for future filtering controls */}
        <h2 className="text-lg font-semibold">Current Batches</h2>
        <Button onClick={() => inventoryModal.onOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Receive Stock
        </Button>
      </div>

      <DataTable columns={columns} data={data} totalPages={totalPages} />

      <InventoryModal variants={variants} />
      <DeleteDialog
        title="Delete Batch"
        description="Removing this batch will deduct its quantity from the master inventory."
        handleDelete={handleDelete}
      />
    </div>
  );
}
