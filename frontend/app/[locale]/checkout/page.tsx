"use client";

import { useState } from "react";
import { ordersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, LogIn, ShoppingBag, CreditCard } from "lucide-react";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const { user } = useAuth();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <LogIn className="size-16 text-muted-foreground/30 mx-auto mb-4" />
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

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
          <CheckCircle2 className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-4">{t("orderPlaced")}</h1>
        <p className="text-muted-foreground mb-4">{t("orderPlacedDesc")}</p>
        <Link href="/orders">
          <Button>{t("viewOrders")}</Button>
        </Link>
      </div>
    );
  }

  async function placeOrder() {
    setPlacing(true);
    try {
      await ordersApi.create();
      setDone(true);
      toast.success(t("orderPlacedSuccess"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("failedToPlace")
      );
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">{t("title")}</h1>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            {t("orderSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("orderSummaryDesc")}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={placeOrder} disabled={placing} className="w-full">
            {placing ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {t("placingOrder")}
              </>
            ) : (
              <>
                <CreditCard className="size-4 mr-2" />
                {t("placeOrder")}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
