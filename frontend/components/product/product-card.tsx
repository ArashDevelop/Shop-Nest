import { type Product } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageOpen } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:ring-1 hover:ring-primary/20 overflow-hidden">
        <CardHeader className="p-0">
          <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <PackageOpen className="size-12 text-muted-foreground/30 transition-transform duration-500 group-hover:scale-110" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">${product.price.toFixed(2)}</span>
          <Badge variant={product.stock > 0 ? "default" : "secondary"} className="text-xs">
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
