"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { productsApi, cartApi, type Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("products");
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    productsApi
      .get(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function addToCart() {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      await cartApi.add(id, quantity);
      toast.success(t("addedToCart"));
    } catch {
      toast.error(t("failedToAdd"));
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("productNotFound")}</h1>
        <Link href="/" className="text-primary hover:underline mt-4 block">
          {t("backToHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-6xl">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover rounded-lg"
            />
          ) : (
            <span>📦</span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold mt-4">
            ${product.price.toFixed(2)}
          </p>
          <Badge
            variant={product.stock > 0 ? "default" : "secondary"}
            className="mt-2"
          >
            {product.stock > 0 ? t("inStock") : t("outOfStock")}
          </Badge>
          <p className="mt-6 text-muted-foreground">{product.description}</p>
          {product.stock > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <Input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20"
              />
              <Button onClick={addToCart}>{t("addToCart")}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
