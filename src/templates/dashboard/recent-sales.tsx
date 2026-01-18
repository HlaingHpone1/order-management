import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OrderStatus } from "@/generated/prisma/client";

interface RecentSaleProps {
  orders: {
    id: string;
    totalAmount: number;
    status: OrderStatus;
    user: {
      name: string;
      email: string;
    };
  }[];
}

export function RecentSales({ orders }: RecentSaleProps) {
  if (orders.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">No recent sales.</div>
    );
  }

  return (
    <div className="space-y-8">
      {orders.map((order) => {
        // Create initials from name
        const initials = order.user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div key={order.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm leading-none font-medium">
                {order.user.name}
              </p>
              <p className="text-muted-foreground text-sm">
                {order.user.email}
              </p>
            </div>
            <div className="ml-auto font-medium">
              +${order.totalAmount.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
