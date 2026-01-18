"use client";

import { Category } from "@/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  CornerDownRight,
} from "lucide-react";
import { useCategoryModal } from "@/stores/use-category-modal";
import SearchBox from "@/components/search-box";
import { DataTable } from "@/components/data-table"; // Your reusable table
import { CategoryModal } from "./CategoryModal";
import { useDeleteModalStore } from "@/stores/useDeleteStore";
import DeleteDialog from "@/components/delete-dialog";
import { deleteCategory } from "./action";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Type definition: Category with Subcategories count & Parent info
type CategoryWithRelations = Category & {
  parentCategory: Category | null;
  _count: { products: number; subCategories: number };
};

interface CategoriesTableProps {
  data: CategoryWithRelations[];
  // We need the full list to populate the "Parent" dropdown in the modal
  allCategories: Category[];
  totalPages: number;
}

export function CategoriesTable({
  data,
  allCategories,
  totalPages,
}: CategoriesTableProps) {
  const categoryModal = useCategoryModal();
  const deleteModal = useDeleteModalStore();

  const handleDeleteCategory = async () => {
    if (!deleteModal.selectedId) return;

    const result = await deleteCategory(deleteModal.selectedId);
    if (result.success) {
      toast.success(result.message);
      deleteModal.setOpen(false);
    } else {
      toast.error(result.error);
    }
  };

  const columns: ColumnDef<CategoryWithRelations>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {/* Visual cue for subcategory */}
          {row.original.parentCategoryId && (
            <CornerDownRight className="text-muted-foreground h-4 w-4" />
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.slug}
        </span>
      ),
    },
    {
      accessorKey: "parentCategoryId",
      header: "Parent",
      cell: ({ row }) =>
        row.original.parentCategory ? (
          <Badge variant="outline">{row.original.parentCategory.name}</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">- Top Level -</span>
        ),
    },
    {
      accessorKey: "_count.products",
      header: "Stats",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <span className="text-muted-foreground text-xs">
            {row.original._count.products} products
          </span>
          {row.original._count.subCategories > 0 && (
            <span className="text-xs font-medium text-blue-600">
              {row.original._count.subCategories} sub-cats
            </span>
          )}
        </div>
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
              <DropdownMenuItem
                onClick={() => categoryModal.onOpen(row.original)}
              >
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
        <SearchBox placeholder="Search categories..." className="w-[300px]" />
        <Button onClick={() => categoryModal.onOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        noDataText="No categories found."
        totalPages={totalPages}
      />

      {/* Pass available parents to modal */}
      <CategoryModal availableParents={allCategories} />

      <DeleteDialog
        title="Delete Category"
        description="Are you sure? This cannot be undone."
        handleDelete={handleDeleteCategory}
      />
    </div>
  );
}
