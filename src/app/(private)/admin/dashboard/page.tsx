import { prisma } from "@/config/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { Overview } from "@/templates/dashboard/overview";
import { RecentSales } from "@/templates/dashboard/recent-sales";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  // 1. Fetch Key Metrics in Parallel
  const [
    totalRevenueResult,
    orderCount,
    userCount,
    activeOrdersCount,
    recentOrders,
    lowStockVariants,
    graphDataRaw,
  ] = await Promise.all([
    // A. Total Revenue (Exclude Cancelled/Returned)
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { notIn: ["Cancelled", "Returned"] } },
    }),

    // B. Total Sales Count
    prisma.order.count(),

    // C. User Count
    prisma.user.count(),

    // D. Active Orders (Processing/Placed/Paid)
    prisma.order.count({
      where: { status: { in: ["Placed", "Paid", "Processing"] } },
    }),

    // E. Recent Orders for list
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),

    // F. Low Stock Alerts
    prisma.productVariant.findMany({
      where: {
        stockLevel: { lte: 10 }, // Hardcoded threshold or compare with reorderPoint
      },
      include: { product: true },
      take: 5,
      orderBy: { stockLevel: "asc" },
    }),

    // G. Graph Data (Last 7 days)
    prisma.order.findMany({
      where: {
        createdAt: { gte: subDays(new Date(), 7) },
        status: { notIn: ["Cancelled", "Returned"] },
      },
      select: { createdAt: true, totalAmount: true },
    }),
  ]);

  const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

  // 2. Process Graph Data (Group by Day)
  const groupedRevenue: Record<string, number> = {};

  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const day = format(subDays(new Date(), i), "MMM dd");
    groupedRevenue[day] = 0;
  }

  // Fill real data
  graphDataRaw.forEach((order) => {
    const day = format(order.createdAt, "MMM dd");
    if (groupedRevenue[day] !== undefined) {
      groupedRevenue[day] += order.totalAmount;
    }
  });

  const chartData = Object.entries(groupedRevenue).map(([name, total]) => ({
    name,
    total,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Top KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-muted-foreground text-xs">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrdersCount}</div>
            <p className="text-muted-foreground text-xs">Needing attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
            <p className="text-muted-foreground text-xs">Orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-muted-foreground text-xs">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Lists */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={chartData} />
          </CardContent>
        </Card>

        {/* Recent Sales List */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSales orders={recentOrders} />
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert Section */}
      {lowStockVariants.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lowStockVariants.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded border border-red-100 bg-white p-3 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-medium">{v.product.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {v.sku} - {v.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-red-600">
                      {v.stockLevel}
                    </span>
                    <p className="text-muted-foreground text-[10px]">Left</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
