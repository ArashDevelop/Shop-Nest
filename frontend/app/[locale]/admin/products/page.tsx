"use client";

import { useState, useEffect } from "react";
import { productsApi, type Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .list()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  async function deleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(t("productDeleted"));
    } catch {
      toast.error(t("failedToDelete"));
    }
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("accessDenied")}</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t("productList")}</h1>
        <Link href="/admin/products/new">
          <Button>{t("addProduct")}</Button>
        </Link>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("price")}</TableHead>
              <TableHead>{t("stock")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={product.stock > 0 ? "default" : "secondary"}
                  >
                    {product.stock}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                  >
                    {t("delete")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
