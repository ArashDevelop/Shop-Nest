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
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

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

export default function OrdersPage() {
  const t = useTranslations("orders");
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
        <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("loginRequired")}{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">{t("noOrders")}</p>
          <Link href="/">
            <Button>{t("startShopping")}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">
                    {t("orderNumber", { id: order.id.slice(0, 8) })}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={statusColors[order.status] || "outline"}>
                  {t(`status.${order.status}`, { defaultValue: order.status })}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex items-center justify-between font-bold">
                    <span>{t("total")}</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
