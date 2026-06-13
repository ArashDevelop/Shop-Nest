"use client";

import { useState, useEffect } from "react";
import { ordersApi, type Order } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  LogIn,
  Receipt,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "secondary",
  CANCELLED: "destructive",
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    ordersApi
      .list()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <LogIn className="size-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">My Dashboard</h1>
        <p className="text-muted-foreground">
          Please{" "}
          <Link href="/login" className="text-primary hover:underline">
            login
          </Link>{" "}
          to view your dashboard.
        </p>
      </div>
    );
  }

  if (loading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <LayoutDashboard className="size-7" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, <span className="font-medium text-foreground">{user.name}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingBag className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("totalOrders")}</p>
              <p className="text-xl font-bold">{orders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Package className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("pendingOrders")}</p>
              <p className="text-xl font-bold">{pendingOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Receipt className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("totalSpent")}</p>
              <p className="text-xl font-bold">${totalSpent.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShoppingCart className="size-4" />
            {t("recentOrders")}
          </CardTitle>
          {orders.length > 0 && (
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                {t("viewAll")} <ArrowRight className="size-3" />
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package className="size-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm mb-4">{t("noOrders")}</p>
              <Link href="/">
                <Button size="sm">{t("startShopping")}</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">
                      {t("orderNumber", { id: order.id.slice(0, 8) })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} &middot; ${order.total.toFixed(2)}
                    </p>
                  </div>
                  <Badge
                    variant={statusColors[order.status] || "outline"}
                    className="text-xs ml-2"
                  >
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
