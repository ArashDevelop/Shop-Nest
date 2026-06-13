"use client";

import { useState, useEffect, use } from "react";
import { productsApi, type Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ShoppingCart, ArrowLeft, PackageOpen } from "lucide-react";

export default function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("products");
  const { user } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    productsApi
      .get(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      router.push("/login");
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(id, quantity);
      toast.success(t("addedToCart"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("failedToAdd"));
    } finally {
      setIsAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton variant="media" className="aspect-video md:aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <div className="space-y-2 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-4 mt-6">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <PackageOpen className="size-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">{t("productNotFound")}</h1>
        <Link href="/" className="text-primary hover:underline mt-4 inline-flex items-center gap-1">
          <ArrowLeft className="size-4" />
          {t("backToHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="size-4" />
        {t("backToHome")}
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-video md:aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <PackageOpen className="size-20 text-muted-foreground/30" />
          )}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-2xl md:text-3xl font-bold mt-4 text-primary">
            ${product.price.toFixed(2)}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <Badge
              variant={product.stock > 0 ? "default" : "secondary"}
              className="text-xs"
            >
              {product.stock > 0 ? t("inStock") : t("outOfStock")}
            </Badge>
            {product.stock > 0 && (
              <span className="text-xs text-muted-foreground">
                {product.stock} available
              </span>
            )}
          </div>
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>
          {product.stock > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full sm:w-24"
              />
               <Button className="w-full sm:w-auto" size="lg" onClick={handleAddToCart} disabled={isAdding || quantity < 1 || quantity > product.stock}>
                {isAdding ? (
                  <>
                    <Spinner size="sm" className="mr-2" /> Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-4 mr-2" />
                    {t("addToCart")}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
