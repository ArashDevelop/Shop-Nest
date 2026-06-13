import { Router, Response } from "express";
import { prisma } from "../index";
import { auth, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/", auth, async (req: AuthRequest, res: Response) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      userId: req.userId!,
      total,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  res.status(201).json(order);
});

router.get("/", auth, async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders);
});

router.get("/:id", auth, async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, userId: req.userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(order);
});

export default router;
