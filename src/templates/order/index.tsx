"use client";

import { Order, OrderStatus } from "@/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/data-table";
import Link from "next/link";
import { format } from "date-fns";

// Extended type for relation data
type OrderListType = Order & {
  user: { name: string; email: string };
  _count: { items: number };
};

// Helper for Status Colors
export const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "Paid":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Processing":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "Shipped":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "Delivered":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

interface OrdersTableProps {
  data: OrderListType[];
  totalPages: number;
}

export function OrdersTable({ data, totalPages }: OrdersTableProps) {
  const columns: ColumnDef<OrderListType>[] = [
    {
      accessorKey: "orderCode",
      header: "Order #",
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.orderCode}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.original.user.name}</span>
          <span className="text-muted-foreground text-xs">
            {row.original.user.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={getStatusColor(row.original.status)}
          variant="outline"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-medium">
          ${row.original.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "_count.items",
      header: "Items",
      cell: ({ row }) => <span>{row.original._count.items} items</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <Link href={`/admin/orders/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data} totalPages={totalPages} />
    </div>
  );
}
