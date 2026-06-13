"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { adminApi, type AdminStats, type Order } from "@/lib/api";
import {
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  ShieldBan,
  ArrowUpRight,
} from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "secondary",
  CANCELLED: "destructive",
};

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ShieldBan className="size-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">{t("accessDenied")}</h1>
      </div>
    );
  }

  if (loading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  const maxStatusCount = Math.max(
    ...(stats?.ordersByStatus.map((s) => s._count) ?? [1]),
    1
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-xl font-bold">${(stats?.totalRevenue ?? 0).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
              <ShoppingBag className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Orders</p>
              <p className="text-xl font-bold">{stats?.totalOrders ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Package className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Products</p>
              <p className="text-xl font-bold">{stats?.totalProducts ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Users className="size-5 text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Users</p>
              <p className="text-xl font-bold">{stats?.totalUsers ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Tables Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Orders by Status Chart */}
        <Card className="lg:col-span-1 transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="size-4" />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.ordersByStatus.map((s) => (
                <div key={s.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{statusLabels[s.status] || s.status}</span>
                    <span className="text-muted-foreground">{s._count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${(s._count / maxStatusCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {(!stats?.ordersByStatus || stats.ordersByStatus.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2 transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs">
                View all <ArrowUpRight className="size-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentOrders.map((order: Order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">
                      {order.user?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${order.total.toFixed(2)} &middot; {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={statusColors[order.status] || "outline"} className="text-xs ml-2">
                    {order.status}
                  </Badge>
                </div>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/products/new">
            <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Package className="size-5 text-primary" />
                <span className="text-sm font-medium">Add Product</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/products">
            <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <ShoppingBag className="size-5 text-blue-500" />
                <span className="text-sm font-medium">Manage Products</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/orders">
            <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="size-5 text-emerald-500" />
                <span className="text-sm font-medium">View Orders</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/users">
            <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="size-5 text-violet-500" />
                <span className="text-sm font-medium">Manage Users</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
