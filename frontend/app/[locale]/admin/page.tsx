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
import { adminApi, type AdminStats, type Order, type RevenueEntry } from "@/lib/api";
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
  const [revenue, setRevenue] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.stats(),
      adminApi.revenue(),
    ])
      .then(([s, r]) => {
        setStats(s);
        setRevenue(r);
      })
      .catch(() => { setStats(null); setRevenue([]); })
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

      {/* Revenue Chart */}
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="size-4" />
            Revenue (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenue.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No revenue data yet</p>
          ) : (
            (() => {
              const revs = revenue.map((r) => r.revenue);
              const minRev = Math.min(...revs);
              const maxRev = Math.max(...revs);
              const range = maxRev - minRev || 1;
              const n = revenue.length;
              const leftW = 48;
              const bottomH = 22;
              const chartW = 600;
              const chartH = 180;
              const plotW = chartW - leftW;
              const plotH = chartH - bottomH;

              const stepX = plotW / (n - 1);

              const toX = (i: number) => leftW + (i / (n - 1)) * plotW;
              const toY = (v: number) => plotH - ((v - minRev) / range) * plotH;

              function fmt$(v: number) {
                if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
                return `$${v.toFixed(0)}`;
              }

              function fmtDate(d: string) {
                const [y, m, day] = d.split("-");
                return `${m}/${day}`;
              }

              const linePath = revenue
                .map((r, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(r.revenue)}`)
                .join(" ");

              const areaPath =
                `M${leftW},${plotH}` +
                revenue.map((r, i) => `L${toX(i)},${toY(r.revenue)}`).join("") +
                `L${leftW + plotW},${plotH}Z`;

              const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => {
                const v = minRev + range * f;
                return { y: toY(v), label: fmt$(v) };
              });

              const xLabelIndices: number[] = [];
              const interval = Math.max(1, Math.floor(n / 7));
              for (let i = 0; i < n; i += interval) xLabelIndices.push(i);
              if (xLabelIndices[xLabelIndices.length - 1] !== n - 1) xLabelIndices.push(n - 1);

              const xLabels = xLabelIndices.map((i) => ({
                x: toX(i),
                label: fmtDate(revenue[i]?.date ?? ""),
              }));

              return (
                <div className="w-full overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${chartW} ${chartH}`}
                    className="w-full min-w-[400px]"
                    style={{ fontFamily: "inherit" }}
                  >
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" className="text-primary/20" />
                        <stop offset="100%" stopColor="currentColor" className="text-primary/5" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines + Y-axis labels */}
                    {yTicks.map((t) => (
                      <g key={t.label}>
                        <line
                          x1={leftW}
                          y1={t.y}
                          x2={leftW + plotW}
                          y2={t.y}
                          stroke="currentColor"
                          className="text-border/40"
                          strokeWidth="0.5"
                        />
                        <text
                          x={leftW - 6}
                          y={t.y + 3}
                          textAnchor="end"
                          className="fill-muted-foreground"
                          fontSize="8"
                          fontFamily="inherit"
                        >
                          {t.label}
                        </text>
                      </g>
                    ))}

                    {/* X-axis labels */}
                    {xLabels.map((t) => (
                      <text
                        key={t.label}
                        x={t.x}
                        y={chartH - 4}
                        textAnchor="middle"
                        className="fill-muted-foreground"
                        fontSize="8"
                        fontFamily="inherit"
                      >
                        {t.label}
                      </text>
                    ))}

                    {/* Area */}
                    <path d={areaPath} fill="url(#areaGrad)" />

                    {/* Bars */}
                    {revenue.map((r, i) => {
                      const bw = Math.max(stepX * 0.4, 3);
                      return (
                        <rect
                          key={r.date}
                          x={toX(i) - bw / 2}
                          y={toY(r.revenue)}
                          width={bw}
                          height={plotH - toY(r.revenue)}
                          rx="1"
                          className="fill-primary/8"
                        />
                      );
                    })}

                    {/* Line */}
                    <path
                      d={linePath}
                      fill="none"
                      stroke="currentColor"
                      className="text-primary"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Dots + hover zones */}
                    {revenue.map((r, i) => {
                      const cx = toX(i);
                      const cy = toY(r.revenue);
                      const isToday = i === n - 1;
                      return (
                        <g key={r.date} className="group cursor-pointer">
                          <rect
                            x={cx - stepX / 2}
                            y={0}
                            width={stepX}
                            height={plotH}
                            className="fill-transparent"
                          />
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isToday ? 3 : 1.5}
                            className="fill-primary stroke-background"
                            strokeWidth="1.5"
                          />
                          <foreignObject
                            x={cx - 50}
                            y={Math.max(cy - 38, 0)}
                            width="100"
                            height="32"
                            className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ overflow: "visible" }}
                          >
                            <div className="flex justify-center">
                              <div className="inline-flex flex-col items-center gap-0.5 rounded-md border bg-popover px-2.5 py-1.5 shadow-lg">
                                <span className="text-[11px] font-semibold tabular-nums text-foreground">
                                  ${r.revenue.toFixed(2)}
                                </span>
                                <span className="text-[9px] text-muted-foreground leading-none">
                                  {r.date}
                                </span>
                              </div>
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              );
            })()
          )}
        </CardContent>
      </Card>

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
