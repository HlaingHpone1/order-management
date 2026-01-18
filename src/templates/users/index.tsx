"use client";

import { useState } from "react";
import { User, UserRole } from "@/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Shield, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteUser, updateUserRole } from "@/templates/users/action";
import { DataTable } from "@/components/data-table";
import { useDeleteModalStore } from "@/stores/useDeleteStore";
import DeleteDialog from "@/components/delete-dialog";
import { CreateUserModal } from "@/templates/users/create-user-modal";
import SearchBox from "@/components/search-box";

interface UsersTableProps {
  initialUsers: User[];
  totalPages: number;
}

export function UsersTable({ initialUsers, totalPages }: UsersTableProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const deleteModal = useDeleteModalStore();

  // 2. Handlers
  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("role", newRole);

    const result = await updateUserRole(formData);
    if (result.success) {
      toast.success(result.message);

      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.selectedId) return;

    const result = await deleteUser(deleteModal.selectedId.toString());
    if (result.success) {
      toast.success(result.message);
      deleteModal.setOpen(false);
    } else {
      toast.error(result.error);
    }
  };

  // 3. Define Columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-muted-foreground text-xs">
                {user.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              role === "admin"
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(user.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleRoleUpdate(user.id, "ADMIN")}
                >
                  <Shield className="mr-2 h-4 w-4" /> Make Admin
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleRoleUpdate(user.id, "MANAGER")}
                >
                  <Users className="mr-2 h-4 w-4" /> Make Manager
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleRoleUpdate(user.id, "CUSTOMER")}
                >
                  <Users className="mr-2 h-4 w-4" /> Make User
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => {
                    deleteModal.setOpen(true);
                    deleteModal.setSelectedId(user.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex justify-between">
        <SearchBox
          placeholder="Search by name or email..."
          className="w-[300px] max-w-none"
        />
        <Button onClick={() => setOpen(true)}>Create User</Button>
      </div>

      {/* Reusable Data Table */}
      <DataTable
        columns={columns}
        data={initialUsers}
        noDataText="No users found matching your search."
        totalPages={totalPages}
      />

      <CreateUserModal open={open} setOpen={setOpen} />

      <DeleteDialog
        title="Delete User"
        description="Are u sure to delete this user"
        handleDelete={handleDelete}
      />
    </div>
  );
}
