"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cartApi, type Cart } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function CartDropdown() {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const data = await cartApi.get();
      if (mountedRef.current) setCart(data);
    } catch {
      if (mountedRef.current) setCart(null);
    } finally {
      if (mountedRef.current) setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    if (user) fetchCart();
    return () => { mountedRef.current = false; };
  }, [user, fetchCart]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    try {
      const updated = await cartApi.updateQuantity(itemId, quantity);
      if (mountedRef.current) setCart(updated);
    } catch {
      toast.error("Failed to update quantity");
    }
  }

  async function removeItem(itemId: string) {
    try {
      const updated = await cartApi.remove(itemId);
      if (mountedRef.current) setCart(updated);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  }

  function handleToggle() {
    if (!open) fetchCart();
    setOpen(!open);
  }

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleToggle}
      >
        <ShoppingCart className="size-5" />
        <span className="absolute -top-1.5 -right-1.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground leading-none">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-popover p-4 shadow-lg z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">
              Cart
              {fetching && <Spinner size="sm" className="ml-2 inline" />}
            </h3>
            <Link
              href="/cart"
              className="text-xs text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>

          {fetching && !cart ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="text-primary" />
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Your cart is empty
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="size-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ShoppingCart className="size-4 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-xs font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {cart && cart.items.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <Link href="/cart" onClick={() => setOpen(false)}>
                <Button className="w-full text-xs h-8">
                  Go to Cart
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
