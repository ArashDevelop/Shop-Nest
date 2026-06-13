"use client";

import { useState, useEffect } from "react";
import { cartApi, type Cart } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
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
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Cart</h1>
        <p className="text-muted-foreground">
          Please{" "}
          <Link href="/login" className="text-primary hover:underline">
            login
          </Link>{" "}
          to view your cart.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const total = (cart?.items ?? []).reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 bg-muted rounded flex items-center justify-center text-2xl flex-shrink-0">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover rounded"
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
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
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardFooter className="flex items-center justify-between p-4">
              <span className="text-lg font-bold">
                Total: ${total.toFixed(2)}
              </span>
              <Button onClick={() => router.push("/checkout")}>
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
