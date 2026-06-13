"use client";

import { useState, useEffect, useRef } from "react";
import { adminApi, type Order } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";
import { Receipt, ShieldBan, ChevronDown, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "secondary",
  CANCELLED: "destructive",
};

function StatusDropdown({
  currentStatus,
  orderId,
  updating,
  onUpdate,
}: {
  currentStatus: string;
  orderId: string;
  updating: boolean;
  onUpdate: (orderId: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs min-w-[120px] justify-between"
        disabled={updating}
        onClick={() => setOpen(!open)}
      >
        {updating ? (
          <Spinner size="sm" />
        ) : (
          <>
            <Badge variant={statusColors[currentStatus] || "outline"} className="text-[10px] px-1.5 h-4">
              {currentStatus}
            </Badge>
            <ChevronDown className="size-3" />
          </>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border bg-popover p-1 shadow-lg z-50">
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted transition-colors cursor-pointer ${
                s === currentStatus ? "bg-muted font-medium" : ""
              }`}
              onClick={() => {
                if (s !== currentStatus) {
                  onUpdate(orderId, s);
                }
                setOpen(false);
              }}
            >
              <Badge variant={statusColors[s] || "outline"} className="text-[10px] px-1.5 h-4">
                {s}
              </Badge>
              {s === currentStatus && <Check className="size-3 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .orders()
      .then((data) => {
        setOrders(data);
        setError(null);
      })
      .catch((err) => {
        setOrders([]);
        setError(err.message || "Failed to load orders");
      })
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const updated = await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ShieldBan className="size-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">{t("accessDenied")}</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">{t("allOrders")}</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-4 w-28 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">{t("allOrders")}</h1>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="size-16 text-destructive/40 mb-4" />
          <p className="text-lg text-muted-foreground mb-2">Failed to load orders</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setLoading(true);
              setError(null);
              adminApi.orders()
                .then((data) => { setOrders(data); setError(null); })
                .catch((err) => { setError(err.message); })
                .finally(() => setLoading(false));
            }}
          >
            Retry
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt className="size-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg text-muted-foreground">{t("noOrders")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm">
                    {t("orderNumber", { id: order.id.slice(0, 8) })}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {order.user?.name} ({order.user?.email})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusDropdown
                  currentStatus={order.status}
                  orderId={order.id}
                  updating={updatingId === order.id}
                  onUpdate={updateStatus}
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate mr-2">
                        {item.product.name} x {item.quantity}
                      </span>
                      <span className="flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex items-center justify-between font-bold">
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
