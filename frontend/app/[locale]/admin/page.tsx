"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function AdminPage() {
  const t = useTranslations("admin");
  const { user } = useAuth();

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("accessDenied")}</h1>
        <p className="text-muted-foreground">{t("accessDeniedDesc")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{t("title")}</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("products")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t("productsDesc")}
            </p>
            <Link href="/admin/products">
              <Button>{t("manageProducts")}</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("orders")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t("ordersDesc")}
            </p>
            <Link href="/admin/orders">
              <Button>{t("viewOrders")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
