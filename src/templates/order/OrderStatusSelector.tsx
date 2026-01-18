"use client";

import { useState } from "react";
import { updateOrderStatus } from "./action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export enum OrderStatus {
  Placed = "Placed",
  Paid = "Paid",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
  Returned = "Returned",
}

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusSelector({ orderId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(currentStatus);

  const handleUpdate = async () => {
    if (status === currentStatus) return;

    setLoading(true);
    const result = await updateOrderStatus(orderId, status);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-[180px]">
        <Select
          value={status}
          onValueChange={(val) => setStatus(val as OrderStatus)}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(OrderStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        size="sm"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update
      </Button>
    </div>
  );
}
