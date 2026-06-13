import Link from "next/link";
import { type Product } from "@/lib/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader className="p-0">
          <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center text-4xl">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover rounded-t-lg"
              />
            ) : (
              <span>📦</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {product.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
          <Badge variant={product.stock > 0 ? "default" : "secondary"}>
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
