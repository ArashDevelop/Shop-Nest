"use client";

import { useState, useEffect } from "react";
import { productsApi, type Product } from "@/lib/api";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Search, PackageOpen } from "lucide-react";

export default function Home() {
  const t = useTranslations("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .list()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mb-6">{t("subtitle")}</p>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PackageOpen className="size-16 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">{t("noProducts")}</p>
        </div>
      )}
    </div>
  );
}
