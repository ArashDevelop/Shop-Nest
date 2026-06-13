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
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-muted-foreground">
          Please{" "}
          <Link href="/login" className="text-primary hover:underline">
            login
          </Link>{" "}
          to checkout.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Placed!</h1>
        <p className="text-muted-foreground mb-4">
          Your order has been placed successfully.
        </p>
        <Link href="/orders">
          <Button>View Orders</Button>
        </Link>
      </div>
    );
  }

  async function placeOrder() {
    setPlacing(true);
    try {
      await ordersApi.create();
      setDone(true);
      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your order will be created from your current cart items.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={placeOrder} disabled={placing} className="w-full">
            {placing ? "Placing Order..." : "Place Order"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
