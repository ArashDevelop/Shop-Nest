"use client";

import { useState, useEffect } from "react";
import { cartApi, type Cart } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ShoppingCart, Trash2, ArrowRight, LogIn, PackageOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartPage() {
  const t = useTranslations("cart");
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    cartApi
      .get()
      .then(setCart)
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, [user]);

  async function removeItem(itemId: string) {
    try {
      const updated = await cartApi.remove(itemId);
      setCart(updated);
      toast.success(t("itemRemoved"));
    } catch {
      toast.error(t("failedToRemove"));
    }
  }

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

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">{t("title")}</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const total = (cart?.items ?? []).reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">{t("title")}</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingCart className="size-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4 text-lg">{t("empty")}</p>
          <Link href="/">
            <Button>{t("continueShopping")}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-4">
                <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PackageOpen className="size-8 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-semibold hover:underline truncate block"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    ${item.product.price.toFixed(2)} x {item.quantity}
                  </p>
                  <p className="text-sm font-bold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="size-4" />
                  <span className="ml-1">{t("remove")}</span>
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card className="border-primary/20">
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
              <span className="text-lg font-bold">
                {t("total")}: ${total.toFixed(2)}
              </span>
              <Button className="w-full sm:w-auto" onClick={() => router.push("/checkout")}>
                {t("proceedToCheckout")}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
